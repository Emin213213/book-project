import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useUserStore} from "@/modules/user";

export default function GoogleConfirmPage() {
    const navigate = useNavigate();
    const {loginGoogle} = useUserStore()
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const confirm = async () => {
            const code = searchParams.get('code');

            if (!code) {
                navigate('/login');
                return;
            }

            try {
                const success = await loginGoogle(code)

                if (success) {
                    navigate('/');

                } else {
                    navigate('/login')
                }
            } catch {
                navigate('/login');
            }
        };
        confirm();
    }, [loginGoogle, navigate, searchParams]);

    return <h2>Authorizing...</h2>;
}
