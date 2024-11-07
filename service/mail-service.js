const nodemailer = require('nodemailer');
class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Активация аккаунта на TaskExchange',
      text: '',
      html: `
				<div style="
					font-family: Arial, sans-serif;
					background-color: #f4f4f4;
					padding: 20px;
				">
					<div style="
						max-width: 600px;
						margin: 0 auto;
						background-color: #fff;
						padding: 30px;
						border-radius: 8px;
						box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
					">
						<h1 style="
							color: #333;
							text-align: center;
							margin-bottom: 20px;
						">Добро пожаловать в TaskExchange!</h1>
	
						<p style="
							font-size: 16px;
							color: #555;
							line-height: 1.5;
							margin-bottom: 30px;
							text-align: center;
						">
							Спасибо за регистрацию! Чтобы завершить процесс и активировать свой аккаунт, 
							нажмите на кнопку ниже:
						</p>
	
						<div style="text-align: center; margin-bottom: 30px;">
							<a href="${link}" style="
								display: inline-block;
								padding: 12px 24px;
								font-size: 16px;
								font-weight: bold;
								color: #fff;
								background-color: #4CAF50;
								text-decoration: none;
								border-radius: 5px;
							">
								Подтвердить почту
							</a>
						</div>
	
						<p style="
							font-size: 14px;
							color: #777;
							text-align: center;
						">
							Если вы не регистрировались на TaskExchange, проигнорируйте это сообщение.
						</p>
					</div>
	
					<footer style="
						text-align: center;
						margin-top: 20px;
						font-size: 12px;
						color: #aaa;
					">
						© 2024 TaskExchange. Все права защищены.
					</footer>
				</div>
			`,
    });
  }
}

module.exports = new MailService();
