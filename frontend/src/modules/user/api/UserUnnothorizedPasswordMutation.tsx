import {useMutation, type UseMutationResult, useQueryClient} from "@tanstack/react-query";
import type {UnnothorizedTokenData} from "@/modules/user/model/user.types.ts";
import {unnathorizedToken} from "@/modules/user/api/userService.ts";

export function useCreateUserMutation(): UseMutationResult<void, Error, UnnothorizedTokenData> {
    const queryClient = useQueryClient();

    return useMutation<void, Error, UnnothorizedTokenData>({
        mutationFn: (data) => unnathorizedToken(data),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['user-unnathorized'],
            }),
    });
}