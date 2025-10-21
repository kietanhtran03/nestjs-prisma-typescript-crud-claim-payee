import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'node_modules/bcryptjs';
import { RegisterUsersDto } from './dto/register.dto';
import { AuditAction } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, req: any): Promise<any> {
    const { username, password } = loginDto;

    const user = await this.databaseService.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Log failed login attempt
      await this.createAuditLog({
        username,
        action: AuditAction.LOGIN_FAILED,
        entity: 'User',
        description: 'User not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw new NotFoundException('Invalid username or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account is locked until ${user.lockedUntil.toISOString()}`,
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: failedAttempts };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await this.databaseService.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await this.createAuditLog({
        userId: user.id,
        username: user.username,
        action: AuditAction.LOGIN_FAILED,
        entity: 'User',
        description: 'Invalid password',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create session
    await this.databaseService.session.create({
      data: {
        userId: user.id,
        refreshToken,
        accessToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Reset failed login attempts and update last login
    await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Log successful login
    await this.createAuditLog({
      userId: user.id,
      username: user.username,
      action: AuditAction.LOGIN,
      entity: 'User',
      description: 'User logged in successfully',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterUsersDto, req: any): Promise<any> {
    const { username, email, password, fullName } = registerDto;

    // Check if user exists
    const existingUser = await this.databaseService.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.databaseService.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
      },
    });

    // Log registration
    await this.createAuditLog({
      userId: user.id,
      username: user.username,
      action: AuditAction.CREATE,
      entity: 'User',
      description: 'New user registered',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async logout(userId: number, token: string, req: any): Promise<void> {
    // Revoke session
    await this.databaseService.session.updateMany({
      where: {
        userId,
        refreshToken: token,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'manual_logout',
      },
    });

    // Log logout
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    await this.createAuditLog({
      userId,
      username: user?.username,
      action: AuditAction.LOGOUT,
      entity: 'User',
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  async refreshTokens(refreshToken: string): Promise<any> {
    // Find session
    const session = await this.databaseService.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(session.user);
    const newRefreshToken = this.generateRefreshToken(session.user);

    // Update session
    await this.databaseService.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        accessToken,
        lastUsedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private generateAccessToken(user: any): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      },
    );
  }

  private generateRefreshToken(user: any): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
  }

  private async createAuditLog(data: any) {
    try {
      await this.databaseService.auditLog.create({ data });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
