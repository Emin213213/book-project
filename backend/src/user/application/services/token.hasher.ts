import {Injectable} from "@nestjs/common";
import {createHash, randomBytes, timingSafeEqual} from 'crypto'

@Injectable()
export class TokenHasher {

    public generate() {
        return randomBytes(32).toString('base64url')
    }

    public hash(token: string ): string {

        return createHash('sha256').update(token).digest('hex')
    }


    public equals(a: string, b:string): boolean {

        const left = Buffer.from(a)
        const right = Buffer.from(b)

        return left.length === right.length && timingSafeEqual(left,right)

    }

}