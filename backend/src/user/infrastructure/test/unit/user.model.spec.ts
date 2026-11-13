

import {Email} from "@/user/domain/value-objects/email.vo";
import {User} from "@/user/domain/entities/user.entity";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

    describe('Create by email',() => {
        it('Should create user with email',() => {
            const email = new Email('fefew@gmail.com')
            const password = '12345'
            const firstName = 'Joe'
            const lastName = 'Goldberg'

            const user = User.createUserByEmail(email,password,firstName,lastName,'test-verification-token',[],Uuid.generate())

            expect(user.email).toEqual(email)
        } )


    })
