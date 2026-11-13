import {RefreshSessionAction} from "@/user/application/actions/session/refresh-session.action";
import {RefreshTokenDto} from "@/user/application/input/session/refresh-token.dto";
import {TokenPairResource} from "@/user/infrastructure/http/customer/resources/token-pair.resource";
import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Inject,
    Ip,
    Param,
    ParseEnumPipe,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";
import {LoginByMailDto} from "@/user/application/input/login-by-mail.dto";
import {LoginByMailAction} from "@/user/application/actions/auth/login-by-mail.action";
import {ForgotPasswordDto} from "@/user/application/input/forgot-password.dto";
import {ForgotPasswordAction} from "@/user/application/actions/forgot-password.action";
import {ResetPasswordDto} from "@/user/application/input/reset-password.dto";
import {ResetPasswordAction} from "@/user/application/actions/auth/reset-password.action";
import {VerifycationEmailAction} from "@/user/application/actions/verifycation-email.action";
import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {OauthRegisterProvider} from "@/user/application/services/oauth-register.provider";
import {ConfirmOauthDto} from "@/user/application/input/confirm-oauth.dto";
import {ConfirmOauthAction} from "@/user/application/actions/confirm-oauth.action";
import {VerifyEmailDto} from "@/user/application/input/verify-email.dto";
import {AuthGuard} from "@/user/infrastructure/http/guards/auth.guard";
import {AuthenticatedRequestType} from "@/common/infrastructure/http/types/authenticated-request.type";
import {UnnauthorizedResetPasswordDto} from "@/user/application/input/unnauthorized-reset-password.dto";
import {UnnauthorizedResetAction} from "@/user/application/actions/unnauthorized-reset.action";
import {AuthResource} from "@/user/infrastructure/http/customer/resources/auth.resouce";
import {ApiConsumes, ApiCreatedResponse, ApiOperation} from "@nestjs/swagger";
import {CreateUserDto} from "@/user/application/input/create-user.dto";
import {CreateUserAction} from "@/user/application/actions/auth/create-user.action";


@Controller('auth')
export class AuthController {

    constructor(
        private readonly loginByMailAction: LoginByMailAction,
        private readonly refreshSessionAction: RefreshSessionAction,
        private readonly createUser: CreateUserAction,
        @Inject() private readonly forgotPasswordAction: ForgotPasswordAction,
        @Inject() private readonly resetPasssword: ResetPasswordAction,
        @Inject() private readonly verificationEmailAction: VerifycationEmailAction,
        @Inject() private readonly confirmOauthAction: ConfirmOauthAction,
        @Inject() private readonly registry: OauthRegisterProvider,
        @Inject() private readonly unnauthorizedResetAction: UnnauthorizedResetAction,
    ) {
    }

    @Post('/register')
    @ApiConsumes('application/json')
    @ApiOperation({
        operationId: 'auth.register',
        summary: 'Register a user',
        description: 'Creates an account and sends a confirmation email without signing the user in.',
    })
    @ApiCreatedResponse({
        description: 'Account created and confirmation email sent',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Registration successful. Check your email to confirm your account.',
                },
            },
            required: ['message'],
        },
    })

    public async register(@Body() context: CreateUserDto): Promise<{ message: string }> {

        const user = await this.createUser.handle(context);

        return {
            message: "Registration successful. Check your email to confirm your account.",
        };
    }


    @Post('/login')
    public async loginByMail(@Body() context: LoginByMailDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string,
    ): Promise<AuthResource> {


        const result = await this.loginByMailAction.handle(context, {
            ip,
            userAgent,
        });

        return AuthResource.make(result.user, result);
    }


    @Post('/refresh')
    @HttpCode(200)
    public async refresh(
        @Body() context: RefreshTokenDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent?: string,
    ): Promise<TokenPairResource> {
        const tokens = await this.refreshSessionAction.handle(
            {ip, userAgent},
            context,
        );

        return TokenPairResource.make(tokens);
    }

    @Post('/forgot-password')
    public async forgotPassword(@Body() context: ForgotPasswordDto) {
        await this.forgotPasswordAction.handle(context)

        return {
            message: 'If an account with that email exists, we’ve sent a password reset link.'
        }
    }

    @UseGuards(AuthGuard)
    @Post('/reset-password')
    public async resetPassword(
        @Req() request: AuthenticatedRequestType,
        @Body() context: ResetPasswordDto,
    ) {

        context.withUser(request.auth.user)
        await this.resetPasssword.handle(context);

        return {
            message: 'Password has been reset successfully'
        }
    }

    @Post('/unnathorized-password')
    @HttpCode(204)
    public async unnauthorizedResetPassword(
        @Body() context: UnnauthorizedResetPasswordDto
    ) {
        await this.unnauthorizedResetAction.handle(context);

    }

    @UseGuards(AuthGuard)
    @Post('/verification-email-token')
    public async verificationEmailToken(@Body() context: VerifyEmailDto) {

        await this.verificationEmailAction.handle(context)

        return {
            message: 'Verification success'
        }
    }


    @Get('/oauth/:provider/uri')
    public async generateOauthUrl(@Param('provider', new ParseEnumPipe(OauthProviderEnum)) provider: OauthProviderEnum) {

        const oauthProvider = this.registry.getProvider(provider)
        return {
            uri: oauthProvider.generateUrl()
        }
    }


    @Post('/oauth/:provider/confirm')
    public async confirmOauth(
        @Body() context: ConfirmOauthDto,
        @Param('provider', new ParseEnumPipe(OauthProviderEnum))
        provider: OauthProviderEnum,
        @Ip() ip: string,
        @Headers('user-agent') userAgent?: string,
    ): Promise<AuthResource> {
        const result = await this.confirmOauthAction.handle(context, provider, {
            ip,
            userAgent,
        });

        return AuthResource.make(result.user, result);
    }

}





