export enum Locale {
    EN = 'en',
    RU = 'ru'

}

 export namespace Locale{
    export function all():Locale[] {
        return  Object.values(Locale) as Locale[]
    }
}