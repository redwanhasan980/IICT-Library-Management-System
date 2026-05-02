import { Card } from '../components/shared/Card';

const AboutLibraryPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-library-forest">About Library</p>
        <h1 className="mt-2 text-4xl font-semibold text-library-ink">IICT Library</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-warm-taupe">
          The IICT Library Management System supports catalog discovery, circulation tracking, outside-book monitoring,
          classification, reports, procurement, and inventory workflows for IICT academic resources.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-library-ink">Academic Resource Access</h2>
          <p className="mt-2 text-sm leading-6 text-warm-taupe">
            Search library holdings by title, author, accession number, department, subject, and call number.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-library-ink">Circulation Records</h2>
          <p className="mt-2 text-sm leading-6 text-warm-taupe">
            Borrowing, returns, due dates, and borrower history are maintained through authenticated workflows.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-library-ink">Library Operations</h2>
          <p className="mt-2 text-sm leading-6 text-warm-taupe">
            Staff can manage catalog records, outside-book logs, reports, procurement, and inventory audit records.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutLibraryPage;
