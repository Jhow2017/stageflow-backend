import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailSender } from '../../domain/auth/application/messaging/email-sender';

@Injectable()
export class NodemailerEmailSender implements EmailSender {
    private transporter: nodemailer.Transporter;

    constructor() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error(
                'SMTP_USER and SMTP_PASS must be configured in .env file',
            );
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true para 465, false para outras portas
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendResetPasswordEmail(
        email: string,
        name: string,
        token: string,
    ): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: email,
                subject: 'Recuperação de Senha - ReservaEstudio',
                html: `
                    <h2>Recuperação de Senha</h2>
                    <p>Olá, ${name}</p>
                    <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>Este link expira em 1 hora.</p>
                    <p>Se você não solicitou esta recuperação, ignore este email.</p>
                    <br>
                    <p>Atenciosamente,<br>Equipe ReservaEstudio</p>
                `,
            });
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            throw new Error(
                `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }
}