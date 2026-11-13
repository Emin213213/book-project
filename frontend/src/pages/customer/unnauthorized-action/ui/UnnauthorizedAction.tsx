import { useNavigate, useSearchParams } from 'react-router-dom';

import { useCreateUserMutation } from '@/modules/user/api/UserUnnothorizedPasswordMutation.tsx';



export const UnnauthorizedAction = () => {


    const { mutate} = useCreateUserMutation();

    const [searchParams ]= useSearchParams();
    const token = searchParams.get('token');
    const router = useNavigate()

    mutate({token:token})

   router('/?action=unnauthorized-password-action')




    return (
       <>
       </>
    )
};

export default UnnauthorizedAction;
