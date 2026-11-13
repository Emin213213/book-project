import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './ResetPasswordPage.module.css';
import { API_URL } from '@/shared/config/api.ts';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const [searchParams] = useSearchParams();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setError(null);

        if (password !== confirm) {
            setError('Пароли не совпадают');
            return;
        }

        const token = searchParams.get('token');

        if (!token) {
            setError('Токен сброса отсутствует');
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/auth/reset-password?token=${token}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        password,
                        passwordConfirmation: confirm,
                    }),
                },
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Ошибка при смене пароля');
                return;
            }

            setDone(true);
        } catch (err) {
            console.error(err);
            setError('Ошибка соединения с сервером');
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrap}><Icon name="lock" /></div>

                    <h1 className={styles.title}>Новый пароль</h1>

                    <p className={styles.subtitle}>
                        {done ? 'Пароль успешно изменён' : 'Придумайте новый пароль для вашего аккаунта'}</p>
                </div>

                {done ? (
                    <>
                        <div className={styles.success}>
                            <div className={styles.successIcon}>
                                <Icon name="check_circle" />
                            </div>

                            <p className={styles.successText}>
                                Ваш пароль обновлён. Теперь вы можете войти с новым паролем.
                            </p>
                        </div>

                        <p className={styles.footer}>
                            <Link to="/login" className={styles.footerLink}>Войти</Link>
                        </p>
                    </>
                ) : (
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit}>
                        {error && (
                            <div className={styles.error}>
                                <Icon name="error_outline" />
                                {error}
                            </div>
                        )}

                        <div className={styles.group}>
                            <label className={styles.label}>
                                Новый пароль
                            </label>

                            <input
                                className={styles.input}
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Введите новый пароль..."
                                required
                            />
                        </div>

                        <div className={styles.group}>
                            <label className={styles.label}>Повторите пароль</label>

                            <input
                                className={styles.input}
                                type="password"
                                value={confirm}
                                onChange={(e) =>
                                    setConfirm(e.target.value)
                                }
                                placeholder="Повторите новый пароль..."
                                required
                            />
                        </div>

                        <button className={styles.submitBtn} type="submit">
                            Сохранить пароль
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}