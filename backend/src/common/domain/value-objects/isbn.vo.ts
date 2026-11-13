import {retry} from "rxjs";

export class Isbn {

    private constructor(public value: string) {
    }



    public static generate() {
        let id: string = Date.now().toString().repeat(2).slice(0, 17)


        const parts: string[] = []
        for (let i = 0; i < id.length; i += 3) {
            parts.push(id.slice(i, i + 3))
        }
        const newId = parts.join('-')

        return new Isbn(newId)

    }

    toString(): string {return this.value;
    }


    public equals(other: Isbn): boolean {
        return this.value === other.value;
    }

    public static

    fromString(value: string
    ) {
        return new Isbn(value)
    }


}

console.log(Isbn.generate())

//
// const id  = Isbn.fromString('412412123412l312321')
//
// const book  = new Book()
// book.isbn = Isbn.generate()
//
// id.equals(book.isbn)


