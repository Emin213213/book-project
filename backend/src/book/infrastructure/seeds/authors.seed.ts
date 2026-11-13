import {DataSource} from 'typeorm';
import dataSource from '../../../../data-source';
import {AuthorStatus} from '../../domain/enum/author-status.enum';
import {seedId, withSeedDataSource} from './seed.helpers';

export const AUTHOR_SEEDS = [
    ['Robert C.', 'Martin', 'robert-c-martin', '1952-12-05'],
    ['Andrew', 'Hunt', 'andrew-hunt', '1964-01-01'],
    ['David', 'Thomas', 'david-thomas', '1956-01-01'],
    ['Martin', 'Fowler', 'martin-fowler', '1963-12-18'],
    ['Erich', 'Gamma', 'erich-gamma', '1961-03-13'],
    ['Richard', 'Helm', 'richard-helm', '1956-01-01'],
    ['Ralph', 'Johnson', 'ralph-johnson', '1955-10-07'],
    ['John', 'Vlissides', 'john-vlissides', '1961-08-02'],
    ['Steve', 'McConnell', 'steve-mcconnell', '1962-01-01'],
    ['Michael', 'Feathers', 'michael-feathers', '1962-01-01'],
    ['Eric', 'Evans', 'eric-evans', '1965-01-01'],
    ['Kent', 'Beck', 'kent-beck', '1961-03-31'],
    ['Joshua', 'Bloch', 'joshua-bloch', '1961-08-28'],
    ['Brian', 'Goetz', 'brian-goetz', '1969-01-01'],
    ['Eric', 'Freeman', 'eric-freeman', '1965-01-01'],
    ['Elisabeth', 'Robson', 'elisabeth-robson', '1965-01-01'],
    ['Douglas', 'Crockford', 'douglas-crockford', '1955-01-01'],
    ['Marijn', 'Haverbeke', 'marijn-haverbeke', '1980-01-01'],
    ['Kyle', 'Simpson', 'kyle-simpson', '1975-01-01'],
    ['Boris', 'Cherny', 'boris-cherny', '1985-01-01'],
    ['Alex', 'Banks', 'alex-banks', '1975-01-01'],
    ['Eve', 'Porcello', 'eve-porcello', '1975-01-01'],
    ['Stoyan', 'Stefanov', 'stoyan-stefanov', '1975-01-01'],
    ['Mario', 'Casciaro', 'mario-casciaro', '1980-01-01'],
    ['Luciano', 'Mammino', 'luciano-mammino', '1987-01-01'],
    ['Eric', 'Matthes', 'eric-matthes', '1972-01-01'],
    ['Luciano', 'Ramalho', 'luciano-ramalho', '1964-01-01'],
    ['Brett', 'Slatkin', 'brett-slatkin', '1980-01-01'],
    ['Al', 'Sweigart', 'al-sweigart', '1980-01-01'],
    ['William', 'Vincent', 'william-vincent', '1980-01-01'],
    ['Alan', 'Donovan', 'alan-donovan', '1970-01-01'],
    ['Brian', 'Kernighan', 'brian-kernighan', '1942-01-01'],
    ['Jon', 'Bodner', 'jon-bodner', '1970-01-01'],
    ['Steve', 'Klabnik', 'steve-klabnik', '1985-01-01'],
    ['Carol', 'Nichols', 'carol-nichols', '1985-01-01'],
    ['Jim', 'Blandy', 'jim-blandy', '1967-01-01'],
    ['Jason', 'Orendorff', 'jason-orendorff', '1975-01-01'],
    ['Leonora', 'Tindall', 'leonora-tindall', '1990-01-01'],
    ['Dennis', 'Ritchie', 'dennis-ritchie', '1941-09-09'],
    ['Stanley', 'Lippman', 'stanley-lippman', '1950-01-01'],
    ['Josee', 'Lajoie', 'josee-lajoie', '1960-01-01'],
    ['Barbara', 'Moo', 'barbara-moo', '1958-01-01'],
    ['Scott', 'Meyers', 'scott-meyers', '1959-04-09'],
    ['Thomas', 'Cormen', 'thomas-cormen', '1956-01-01'],
    ['Charles', 'Leiserson', 'charles-leiserson', '1953-11-10'],
    ['Ronald', 'Rivest', 'ronald-rivest', '1947-05-06'],
    ['Clifford', 'Stein', 'clifford-stein', '1965-01-01'],
    ['Robert', 'Sedgewick', 'robert-sedgewick', '1946-12-20'],
    ['Kevin', 'Wayne', 'kevin-wayne', '1971-01-01'],
    ['Aditya', 'Bhargava', 'aditya-bhargava', '1981-01-01'],
    ['Harold', 'Abelson', 'harold-abelson', '1947-04-26'],
    ['Gerald Jay', 'Sussman', 'gerald-jay-sussman', '1947-02-08'],
    ['Martin', 'Kleppmann', 'martin-kleppmann', '1985-01-01'],
    ['Alex', 'Petrov', 'alex-petrov', '1985-01-01'],
    ['Joe', 'Reis', 'joe-reis', '1980-01-01'],
    ['Matt', 'Housley', 'matt-housley', '1980-01-01'],
    ['Alex', 'Xu', 'alex-xu', '1985-01-01'],
    ['Betsy', 'Beyer', 'betsy-beyer', '1970-01-01'],
    ['Chris', 'Jones', 'chris-jones', '1970-01-01'],
    ['Jennifer', 'Petoff', 'jennifer-petoff', '1970-01-01'],
    ['Niall Richard', 'Murphy', 'niall-richard-murphy', '1970-01-01'],
    ['Gene', 'Kim', 'gene-kim', '1971-01-01'],
    ['Jez', 'Humble', 'jez-humble', '1976-01-01'],
    ['Patrick', 'Debois', 'patrick-debois', '1970-01-01'],
    ['John', 'Willis', 'john-willis', '1970-01-01'],
    ['Kevin', 'Behr', 'kevin-behr', '1970-01-01'],
    ['George', 'Spafford', 'george-spafford', '1970-01-01'],
    ['Brendan', 'Burns', 'brendan-burns', '1976-01-01'],
    ['Joe', 'Beda', 'joe-beda', '1975-01-01'],
    ['Kelsey', 'Hightower', 'kelsey-hightower', '1981-02-27'],
    ['Nigel', 'Poulton', 'nigel-poulton', '1970-01-01'],
    ['Yevgeniy', 'Brikman', 'yevgeniy-brikman', '1987-01-01'],
    ['Michael T.', 'Nygard', 'michael-t-nygard', '1966-01-01'],
    ['Sam', 'Newman', 'sam-newman', '1975-01-01'],
    ['Neal', 'Ford', 'neal-ford', '1964-01-01'],
    ['Mark', 'Richards', 'mark-richards', '1960-01-01'],
    ['Pramod', 'Sadalage', 'pramod-sadalage', '1965-01-01'],
    ['Zhamak', 'Dehghani', 'zhamak-dehghani', '1975-01-01'],
] as const;

export const authorId = (slug: string): string => {
    const index = AUTHOR_SEEDS.findIndex((author) => author[2] === slug);
    if (index < 0) throw new Error(`Unknown seeded author: ${slug}`);
    return seedId(101 + index);
};

export async function seedAuthors(db: DataSource): Promise<void> {
    for (const [index, [firstName, lastName, slug, bornDate]] of AUTHOR_SEEDS.entries()) {
        await db.query(
            `INSERT INTO authors (id, first_name, last_name, slug, status, born_date)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE first_name = VALUES(first_name),
                 last_name = VALUES(last_name), slug = VALUES(slug),
                 status = VALUES(status), born_date = VALUES(born_date)`,
            [seedId(101 + index), firstName, lastName, slug, AuthorStatus.PUBLISHED, bornDate],
        );
    }
    console.log(`Seeded ${AUTHOR_SEEDS.length} authors.`);
}

if (require.main === module) {
    void withSeedDataSource(dataSource, seedAuthors).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
