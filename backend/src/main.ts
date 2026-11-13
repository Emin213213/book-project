import {NestFactory} from '@nestjs/core';
import {
    HttpStatus, INestApplication,
    UnprocessableEntityException,
    ValidationPipe,
} from '@nestjs/common';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {setupDocs} from "@/common/docs/setup-docs";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    setupDocs(app,'api/v1')
    initErrors(app)

    app.setGlobalPrefix('api/v1')
    await app.listen(process.env.PORT ?? 8000);
}

void bootstrap();


function initErrors(app: INestApplication) {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            exceptionFactory: (errors) => {
                const messages: Record<string, string[]> = {};
                for (const error of errors) {
                    messages[error.property] = Object.values(error.constraints ?? {});
                }
                return new UnprocessableEntityException({
                    message: 'Validation failed',
                    errors: messages,
                });
            },
        }),
    );
}
