import {mkdir, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {DataSource} from 'typeorm';
import dataSource from '../../../../data-source';
import {CATEGORY_SEEDS} from './categories.seed';
import {authorId} from './authors.seed';
import {seedId, withSeedDataSource} from './seed.helpers';

interface BookSeed {
    title: string;
    slug: string;
    isbn: string;
    category: typeof CATEGORY_SEEDS[number][1];
    authors: string[];
    year: number;
    pages: number;
    price: number;
    quantity: number;
    description: string;
    coverUrl: string;
}

const book = (
    title: string,
    slug: string,
    isbn: string,
    category: BookSeed['category'],
    authors: string[],
    year: number,
    pages: number,
    price: number,
): BookSeed => ({
    title, slug, isbn, category, authors, year, pages, price,
    quantity: 5 + (year % 16),
    description: `${title} — a practical programming and software engineering book.`,
    coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
});

/** Real publications; cover URLs are kept here so the seed is reproducible. */
export const BOOK_SEEDS: BookSeed[] = [
    book('Clean Code', 'clean-code', '9780132350884', 'software-craftsmanship', ['robert-c-martin'], 2008, 464, 45),
    book('Clean Architecture', 'clean-architecture', '9780134494166', 'software-architecture', ['robert-c-martin'], 2017, 432, 48),
    book('The Clean Coder', 'the-clean-coder', '9780137081073', 'software-craftsmanship', ['robert-c-martin'], 2011, 256, 42),
    book('The Pragmatic Programmer', 'the-pragmatic-programmer', '9780135957059', 'software-craftsmanship', ['andrew-hunt', 'david-thomas'], 2019, 352, 50),
    book('Refactoring', 'refactoring', '9780134757599', 'software-craftsmanship', ['martin-fowler'], 2018, 448, 55),
    book('Design Patterns', 'design-patterns', '9780201633610', 'software-architecture', ['erich-gamma', 'richard-helm', 'ralph-johnson', 'john-vlissides'], 1994, 395, 58),
    book('Code Complete', 'code-complete', '9780735619678', 'software-craftsmanship', ['steve-mcconnell'], 2004, 960, 52),
    book('Working Effectively with Legacy Code', 'working-effectively-with-legacy-code', '9780131177055', 'software-craftsmanship', ['michael-feathers'], 2004, 456, 49),
    book('Domain-Driven Design', 'domain-driven-design', '9780321125217', 'software-architecture', ['eric-evans'], 2003, 560, 59),
    book('Test Driven Development', 'test-driven-development', '9780321146533', 'software-craftsmanship', ['kent-beck'], 2002, 240, 42),
    book('Effective Java', 'effective-java', '9780134685991', 'java-jvm', ['joshua-bloch'], 2017, 416, 52),
    book('Java Concurrency in Practice', 'java-concurrency-in-practice', '9780321349606', 'java-jvm', ['brian-goetz'], 2006, 432, 54),
    book('Head First Design Patterns', 'head-first-design-patterns', '9781492078005', 'software-architecture', ['eric-freeman', 'elisabeth-robson'], 2020, 672, 48),
    book('JavaScript: The Good Parts', 'javascript-the-good-parts', '9780596517748', 'javascript-typescript', ['douglas-crockford'], 2008, 176, 35),
    book('Eloquent JavaScript', 'eloquent-javascript', '9781593279509', 'javascript-typescript', ['marijn-haverbeke'], 2018, 472, 39),
    book("You Don't Know JS: Up & Going", 'you-dont-know-js-up-and-going', '9781491924464', 'javascript-typescript', ['kyle-simpson'], 2015, 88, 38),
    book('Programming TypeScript', 'programming-typescript', '9781492037651', 'javascript-typescript', ['boris-cherny'], 2019, 324, 44),
    book('Learning React', 'learning-react', '9781492051725', 'web-development', ['alex-banks', 'eve-porcello'], 2020, 310, 46),
    book('React: Up & Running', 'react-up-and-running', '9781492051466', 'web-development', ['stoyan-stefanov'], 2021, 222, 41),
    book('Node.js Design Patterns', 'nodejs-design-patterns', '9781785885587', 'javascript-typescript', ['mario-casciaro', 'luciano-mammino'], 2016, 520, 54),
    book('Python Crash Course', 'python-crash-course', '9781718502703', 'python', ['eric-matthes'], 2023, 552, 45),
    book('Fluent Python', 'fluent-python', '9781492056355', 'python', ['luciano-ramalho'], 2022, 1014, 60),
    book('Effective Python', 'effective-python', '9780134853987', 'python', ['brett-slatkin'], 2019, 480, 48),
    book('Automate the Boring Stuff with Python', 'automate-the-boring-stuff-with-python', '9781593279929', 'python', ['al-sweigart'], 2019, 592, 42),
    book('Django for Beginners', 'django-for-beginners', '9781735467207', 'web-development', ['william-vincent'], 2020, 316, 39),
    book('The Go Programming Language', 'the-go-programming-language', '9780134190440', 'systems-programming', ['alan-donovan', 'brian-kernighan'], 2015, 400, 49),
    book('Learning Go', 'learning-go', '9781492077213', 'systems-programming', ['jon-bodner'], 2021, 375, 52),
    book('The Rust Programming Language', 'the-rust-programming-language', '9781718503106', 'systems-programming', ['steve-klabnik', 'carol-nichols'], 2023, 560, 49),
    book('Programming Rust', 'programming-rust', '9781491927281', 'systems-programming', ['jim-blandy', 'jason-orendorff'], 2017, 620, 59),
    book('The C Programming Language', 'the-c-programming-language', '9780131103627', 'systems-programming', ['brian-kernighan', 'dennis-ritchie'], 1988, 288, 44),
    book('C++ Primer', 'cpp-primer', '9780321714114', 'systems-programming', ['stanley-lippman', 'josee-lajoie', 'barbara-moo'], 2012, 976, 58),
    book('Effective Modern C++', 'effective-modern-cpp', '9781491903995', 'systems-programming', ['scott-meyers'], 2014, 334, 47),
    book('Introduction to Algorithms', 'introduction-to-algorithms', '9780262046305', 'algorithms-computer-science', ['thomas-cormen', 'charles-leiserson', 'ronald-rivest', 'clifford-stein'], 2022, 1312, 85),
    book('Algorithms', 'algorithms', '9780321573513', 'algorithms-computer-science', ['robert-sedgewick', 'kevin-wayne'], 2011, 976, 62),
    book('Grokking Algorithms', 'grokking-algorithms', '9781617292231', 'algorithms-computer-science', ['aditya-bhargava'], 2016, 256, 44),
    book('Structure and Interpretation of Computer Programs', 'structure-and-interpretation-of-computer-programs', '9780262510875', 'algorithms-computer-science', ['harold-abelson', 'gerald-jay-sussman'], 1996, 657, 55),
    book('Designing Data-Intensive Applications', 'designing-data-intensive-applications', '9781449373320', 'data-engineering', ['martin-kleppmann'], 2017, 616, 60),
    book('Database Internals', 'database-internals', '9781492040347', 'data-engineering', ['alex-petrov'], 2019, 376, 52),
    book('Fundamentals of Data Engineering', 'fundamentals-of-data-engineering', '9781098108304', 'data-engineering', ['joe-reis', 'matt-housley'], 2022, 446, 58),
    book('System Design Interview', 'system-design-interview', '9781736049112', 'software-architecture', ['alex-xu'], 2020, 322, 45),
    book('Site Reliability Engineering', 'site-reliability-engineering', '9781491929124', 'devops-cloud', ['betsy-beyer', 'chris-jones', 'jennifer-petoff', 'niall-richard-murphy'], 2016, 552, 55),
    book('The DevOps Handbook', 'the-devops-handbook', '9781950508402', 'devops-cloud', ['gene-kim', 'jez-humble', 'patrick-debois', 'john-willis'], 2021, 480, 52),
    book('The Phoenix Project', 'the-phoenix-project', '9781942788294', 'devops-cloud', ['gene-kim', 'kevin-behr', 'george-spafford'], 2018, 432, 39),
    book('Kubernetes: Up and Running', 'kubernetes-up-and-running', '9781098110208', 'devops-cloud', ['brendan-burns', 'joe-beda', 'kelsey-hightower'], 2022, 326, 52),
    book('Docker Deep Dive', 'docker-deep-dive', '9781521822807', 'devops-cloud', ['nigel-poulton'], 2017, 419, 38),
    book('Terraform: Up & Running', 'terraform-up-and-running', '9781492046905', 'devops-cloud', ['yevgeniy-brikman'], 2019, 350, 51),
    book('Release It!', 'release-it', '9781680502398', 'software-architecture', ['michael-t-nygard'], 2018, 376, 47),
    book('Building Microservices', 'building-microservices', '9781492034025', 'software-architecture', ['sam-newman'], 2021, 612, 58),
    book('Monolith to Microservices', 'monolith-to-microservices', '9781492047841', 'software-architecture', ['sam-newman'], 2019, 272, 44),
    book('Software Architecture: The Hard Parts', 'software-architecture-the-hard-parts', '9781492086895', 'software-architecture', ['neal-ford', 'mark-richards', 'pramod-sadalage', 'zhamak-dehghani'], 2021, 462, 58),
];

const categoryId = (slug: BookSeed['category']): string => {
    const index = CATEGORY_SEEDS.findIndex((category) => category[1] === slug);
    if (index < 0) throw new Error(`Unknown seeded category: ${slug}`);
    return seedId(index + 1);
};

async function downloadCover(seed: BookSeed, id: string): Promise<string> {
    const relativePath = path.posix.join('book', id, 'cover.jpg');
    const absolutePath = path.join(
        process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'storage'),
        'book',
        relativePath,
    );
    try {
        if ((await stat(absolutePath)).size >= 1_000) return relativePath;
    } catch {
        // The first run downloads the file below.
    }
    const response = await fetch(seed.coverUrl, {signal: AbortSignal.timeout(20_000)});
    if (!response.ok) throw new Error(`Cover download failed (${response.status}): ${seed.coverUrl}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1_000) throw new Error(`Invalid cover returned: ${seed.coverUrl}`);
    await mkdir(path.dirname(absolutePath), {recursive: true});
    await writeFile(absolutePath, bytes);
    return relativePath;
}

export async function seedBooks(db: DataSource): Promise<void> {
    for (const [index, seed] of BOOK_SEEDS.entries()) {
        const id = seedId(1001 + index);
        const cover = await downloadCover(seed, id);

        await db.transaction(async (manager) => {
            await manager.query(
                `INSERT INTO books
                    (id, isbn, slug, title, description, category_id, price, pages, year,
                     quantity, real_quantity, cover)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE isbn = VALUES(isbn), slug = VALUES(slug),
                    title = VALUES(title), description = VALUES(description),
                    category_id = VALUES(category_id), price = VALUES(price),
                    pages = VALUES(pages), year = VALUES(year), quantity = VALUES(quantity),
                    real_quantity = VALUES(real_quantity), cover = VALUES(cover)`,
                [id, seed.isbn, seed.slug, seed.title, seed.description,
                    categoryId(seed.category), seed.price, seed.pages, seed.year,
                    seed.quantity, seed.quantity, cover],
            );
            await manager.query('DELETE FROM book_authors WHERE book_id = ?', [id]);
            for (const authorSlug of seed.authors) {
                await manager.query(
                    'INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)',
                    [id, authorId(authorSlug)],
                );
            }
        });
        console.log(`Seeded book ${index + 1}/${BOOK_SEEDS.length}: ${seed.title}`);
    }
}

if (require.main === module) {
    void withSeedDataSource(dataSource, seedBooks).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
