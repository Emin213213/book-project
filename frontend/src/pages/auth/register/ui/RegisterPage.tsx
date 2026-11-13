import {useState, type FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useUserStore} from '@/modules/user';
import Icon from '@/shared/ui/Icon.tsx';
import styles from '@/shared/ui/AuthForm.module.css';
import {API_URL} from "@/shared/config/api.ts";
import {ErrorCode} from "@/modules/user";

type AuthMethod = 'email' | 'phone';

interface ValidationErrorResponse {
    message: string;

    errors: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];

        [key: string]: string[] | undefined;
    };
}


export default function RegisterPage() {
    const navigate = useNavigate();
    const {register, error} = useUserStore();
    const [method, setMethod] = useState<AuthMethod>('email');
    const [errors, setErrors] = useState<ValidationErrorResponse>({
        message: '', errors: {}
    });

    // Email fields
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // Phone fields
    const [phone, setPhone] = useState('');
    const [phoneName, setPhoneName] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [shown, setShown] = useState(false);

    const [localError, setLocalError] = useState('');


    const parserErrorCode = (error: string): void => {

        switch (error) {
            case  ErrorCode.USER_EMAIL_ALREADY_EXISTS:
                setLocalError('Юзер уже существует')
        }

    }

    const handleEmailSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setLocalError('Пароли не совпадают');
            return;
        }

        const user = {
            firstName: name,
            lastName: surname,
            email: email,
            password: password
        }

        try {
            const res = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })

            if (res.ok) {

                const data = await res.json()

                console.log(data)
            } else if (res.status === 422) {
                const data = await res.json()
                setErrors(data)

                console.log('res data',)
            } else {
                const data: {
                    message: string,
                    errorCode: string,
                    statusCode: number
                } = await res.json()
                console.log(data)
                console.log(parserErrorCode(data.errorCode))

            }

        } catch (err) {
            console.log(err)
        }


    };

    const findVallidationErrors = (key: string): string | undefined => {

        return errors.errors[key]?.[0]
    }


    const handleSendCode = (e: FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || !phoneName.trim()) return;
        setCodeSent(true);
    };

    const
        handlePhoneSubmit = async (e: FormEvent) => {
            e.preventDefault();
            if (code.length === 4) {
                // Демо: регистрируем с email на основе телефона
                const fakeEmail = phone.replace(/\D/g, '') + '@phone.local';
                const success = await register({name: phoneName.trim(), email: fakeEmail, password: '123456'});
                if (success) navigate('/');
            }
        };

    const displayError = localError || error;

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrap}>
                        <Icon name="person_add"/>
                    </div>
                    <h1 className={styles.title}>Регистрация</h1>
                    <p className={styles.subtitle}>Создайте аккаунт для покупок</p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${method === 'email' ? styles.tabActive : ''}`}
                        onClick={() => {
                            setMethod('email');


                        }}
                    >
                        <Icon name="email"/> Email
                    </button>
                    <button
                        className={`${styles.tab} ${method === 'phone' ? styles.tabActive : ''}`}
                        onClick={() => {
                            setMethod('phone');

                            setCodeSent(false);
                        }}
                    >
                        <Icon name="phone"/> Телефон
                    </button>
                </div>

                {method === 'email' ? (
                    <form className={styles.form} onSubmit={handleEmailSubmit}>
                        {displayError && (
                            <div className={styles.error}>
                                <Icon name="error_outline"/>
                                {displayError}
                                <button type="button" className={styles.errorClose} onClick={() => {

                                }}>
                                    <Icon name="close"/>
                                </button>
                            </div>
                        )}
                        <div className={styles.group}>
                            <label className={styles.label}>Имя</label>
                            <input className={styles.input} type="text" placeholder="Ваше имя..." value={name}
                                   onChange={e => setName(e.target.value)} required/>
                            {findVallidationErrors('firstName') && (
                                <p className={styles.registerForm}>
                                    {findVallidationErrors('firstName')}
                                </p>
                            )}
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Фамилия</label>
                            <input className={styles.input} type="text" placeholder="Ваше фамилия..." value={surname}
                                   onChange={e => setSurname(e.target.value)} required/>
                            {findVallidationErrors('lastName') && (
                                <p className={styles.registerForm}>
                                    {findVallidationErrors('lastName')}
                                </p>
                            )}
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Email</label>
                            <input className={styles.input} type="email" placeholder="email@example.com" value={email}
                                   onChange={e => setEmail(e.target.value)} required/>
                        </div>
                        {findVallidationErrors('email') && (
                            <p className={styles.registerForm}>
                                {findVallidationErrors('email')}
                            </p>
                        )}
                        <div className={styles.group}>
                            <label className={styles.label}>Пароль</label>
                            <input className={styles.input} placeholder="Минимум 6 символов..."
                                   type={shown ? 'text' : 'password'}
                                   value={password}
                                   onChange={e => setPassword(e.target.value)} required minLength={6}/>
                            <button onClick={() => setShown(!shown)}>show/hide</button>
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>Подтвердите пароль</label>
                            <input className={styles.input} type="password" placeholder="Повторите пароль..."
                                   value={confirm}
                                   onChange={e => setConfirm(e.target.value)} required/>
                        </div>
                        {findVallidationErrors('password') && (
                            <p className={styles.registerForm}>
                                {findVallidationErrors('password')}
                            </p>
                        )}
                        <button className={styles.submitBtn} type="submit">Зарегистрироваться</button>
                    </form>
                ) : (
                    <form className={styles.form} onSubmit={codeSent ? handlePhoneSubmit : handleSendCode}>
                        <div className={styles.group}>
                            <label className={styles.label}>Имя</label>
                            <input className={styles.input} type="text" placeholder="Ваше имя..." value={phoneName}
                                   onChange={e => setPhoneName(e.target.value)} required disabled={codeSent}/>
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Номер телефона</label>
                            <input className={styles.input} type="tel" placeholder="+380 (XX) XXX-XX-XX" value={phone}
                                   onChange={e => setPhone(e.target.value)} required disabled={codeSent}/>
                        </div>
                        {codeSent && (
                            <div className={styles.group}>
                                <label className={styles.label}>Код из SMS</label>
                                <input
                                    className={`${styles.input} ${styles.codeInput}`}
                                    type="text"
                                    placeholder="0000"
                                    value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    autoFocus
                                    required
                                />
                                <button type="button" className={styles.resendBtn} onClick={() => setCodeSent(false)}>
                                    Отправить код повторно
                                </button>
                            </div>
                        )}
                        <button className={styles.submitBtn} type="submit">
                            {codeSent ? 'Подтвердить' : 'Получить код'}
                        </button>
                    </form>
                )}

                <div className={styles.divider}>
                    <span>или через</span>
                </div>

                <div className={styles.socials}>
                    <button className={styles.socialBtn} type="button" title="Google">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </button>
                    <button className={styles.socialBtn} type="button" title="GitHub">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor"
                                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                    </button>
                    <button className={styles.socialBtn} type="button" title="LinkedIn">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#0A66C2"
                                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </button>
                </div>

                <p className={styles.footer}>
                    Уже есть аккаунт? <Link to="/login" className={styles.footerLink}>Войти</Link>
                </p>
            </div>
        </div>
    );
}
