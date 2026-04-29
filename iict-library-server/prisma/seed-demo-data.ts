import bcrypt from 'bcryptjs';
import { LoanStatus, OutsideBookEntryStatus, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const coverImageUrl = '/images/book-cover-placeholder.svg';

const books = [
  ['DEMO-2001', 'Introduction to Algorithms', 'Thomas H. Cormen', 'CSE', 'Algorithms', 5.1, 'COR'],
  ['DEMO-2002', 'Database System Concepts', 'Abraham Silberschatz', 'CSE', 'Database Systems', 5.74, 'SIL'],
  ['DEMO-2003', 'Clean Code', 'Robert C. Martin', 'SWE', 'Software Engineering', 5.1, 'MAR'],
  ['DEMO-2004', 'Software Engineering', 'Ian Sommerville', 'SWE', 'Software Engineering', 5.12, 'SOM'],
  ['DEMO-2005', 'Computer Networks', 'Andrew S. Tanenbaum', 'CSE', 'Networking', 4.6, 'TAN'],
  ['DEMO-2006', 'Operating System Concepts', 'Abraham Silberschatz', 'CSE', 'Operating Systems', 5.43, 'SIL'],
  ['DEMO-2007', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', 'CSE', 'Artificial Intelligence', 6.3, 'RUS'],
  ['DEMO-2008', 'Digital Design', 'M. Morris Mano', 'EEE', 'Digital Logic', 621.39, 'MAN'],
  ['DEMO-2009', 'Microelectronic Circuits', 'Adel S. Sedra', 'EEE', 'Electronics', 621.381, 'SED'],
  ['DEMO-2010', 'Signals and Systems', 'Alan V. Oppenheim', 'EEE', 'Signals', 621.382, 'OPP'],
  ['DEMO-2011', 'Design Patterns', 'Erich Gamma', 'SWE', 'Software Design', 5.12, 'GAM'],
  ['DEMO-2012', 'Refactoring', 'Martin Fowler', 'SWE', 'Software Maintenance', 5.14, 'FOW'],
  ['DEMO-2013', 'The Pragmatic Programmer', 'Andrew Hunt', 'SWE', 'Programming Practice', 5.1, 'HUN'],
  ['DEMO-2014', 'Computer Organization and Design', 'David A. Patterson', 'CSE', 'Computer Architecture', 4.22, 'PAT'],
  ['DEMO-2015', 'Data Mining Concepts and Techniques', 'Jiawei Han', 'CSE', 'Data Mining', 6.312, 'HAN'],
  ['DEMO-2016', 'Machine Learning', 'Tom M. Mitchell', 'CSE', 'Machine Learning', 6.31, 'MIT'],
  ['DEMO-2017', 'Control Systems Engineering', 'Norman S. Nise', 'EEE', 'Control Systems', 629.8, 'NIS'],
  ['DEMO-2018', 'Power System Analysis', 'John J. Grainger', 'EEE', 'Power Systems', 621.319, 'GRA'],
  ['DEMO-2019', 'Human-Computer Interaction', 'Alan Dix', 'SWE', 'HCI', 4.019, 'DIX'],
  ['DEMO-2020', 'Engineering Software Products', 'Ian Sommerville', 'SWE', 'Software Products', 5.3, 'SOM'],
] as const;

const hashPassword = (password: string) => bcrypt.hash(password, 12);

async function ensureUser() {
  const [adminPassword, studentPassword, teacherPassword] = await Promise.all([
    hashPassword('Admin@12345'),
    hashPassword('Student@12345'),
    hashPassword('Teacher@12345'),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin.demo@iict.local' },
    update: { name: 'Demo Admin', password: adminPassword, isActive: true, role: Role.ADMIN },
    create: {
      email: 'admin.demo@iict.local',
      password: adminPassword,
      name: 'Demo Admin',
      role: Role.ADMIN,
      admin: { create: {} },
    },
    include: { admin: true },
  });

  if (!admin.admin) {
    await prisma.adminProfile.create({ data: { userId: admin.id } });
  }

  const student = await prisma.user.upsert({
    where: { email: 'student.demo@iict.local' },
    update: { name: 'Demo Student', password: studentPassword, isActive: true, role: Role.STUDENT },
    create: {
      email: 'student.demo@iict.local',
      password: studentPassword,
      name: 'Demo Student',
      role: Role.STUDENT,
      student: {
        create: {
          studentRegNumber: 'DEMO-STU-001',
          phoneNumber: '01700000001',
          department: 'SWE',
          currentSemester: 6,
        },
      },
    },
    include: { student: true },
  });

  if (!student.student) {
    await prisma.studentProfile.create({
      data: {
        userId: student.id,
        studentRegNumber: 'DEMO-STU-001',
        phoneNumber: '01700000001',
        department: 'SWE',
        currentSemester: 6,
      },
    });
  } else {
    await prisma.studentProfile.update({
      where: { id: student.student.id },
      data: {
        studentRegNumber: 'DEMO-STU-001',
        phoneNumber: '01700000001',
        department: 'SWE',
        currentSemester: 6,
      },
    });
  }

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher.demo@iict.local' },
    update: { name: 'Demo Teacher', password: teacherPassword, isActive: true, role: Role.TEACHER },
    create: {
      email: 'teacher.demo@iict.local',
      password: teacherPassword,
      name: 'Demo Teacher',
      role: Role.TEACHER,
      teacher: {
        create: {
          teacherId: 'DEMO-TCH-001',
          department: 'CSE',
          designation: 'Lecturer',
          signatureData: 'Demo Teacher',
        },
      },
    },
    include: { teacher: true },
  });

  if (!teacher.teacher) {
    await prisma.teacherProfile.create({
      data: {
        userId: teacher.id,
        teacherId: 'DEMO-TCH-001',
        department: 'CSE',
        designation: 'Lecturer',
        signatureData: 'Demo Teacher',
      },
    });
  } else {
    await prisma.teacherProfile.update({
      where: { id: teacher.teacher.id },
      data: {
        teacherId: 'DEMO-TCH-001',
        department: 'CSE',
        designation: 'Lecturer',
        signatureData: 'Demo Teacher',
      },
    });
  }

  return { admin, student, teacher };
}

async function seedBooks() {
  const created = [];

  for (const [index, row] of books.entries()) {
    const [accessionNumber, title, author, department, subjectCategory, ddc, cutterCode] = row;
    const totalCopies = index % 4 === 0 ? 3 : index % 3 === 0 ? 2 : 1;
    const book = await prisma.book.upsert({
      where: { accessionNumber },
      update: {
        title,
        author,
        authorEditor: author,
        department,
        subjectCategory,
        deweyDecimalNumber: ddc,
        cutterCode,
        callNumber: `${ddc.toFixed(3)} ${cutterCode}`,
        locationCode: `${department}-S${(index % 5) + 1}`,
        coverImageUrl,
        totalCopies,
        isArchived: false,
      },
      create: {
        accessionNumber,
        title,
        author,
        authorEditor: author,
        isbn: `978-demo-${2000 + index}`,
        publisher: 'IICT Demo Library',
        placeOfPublication: 'Sylhet',
        source: 'PURCHASE',
        binding: 'HB',
        department,
        subjectCategory,
        deweyDecimalNumber: ddc,
        cutterCode,
        callNumber: `${ddc.toFixed(3)} ${cutterCode}`,
        locationCode: `${department}-S${(index % 5) + 1}`,
        barcode: `DEMO-BC-${2001 + index}`,
        totalCopies,
        availableCopies: totalCopies,
        catalogEntryDate: new Date(),
        coverImageUrl,
      },
    });
    created.push(book);
  }

  return created;
}

async function seedActivity(studentId: string, teacherId: string, adminId: string, demoBooks: Awaited<ReturnType<typeof seedBooks>>) {
  const [studentProfile, teacherProfile] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({ where: { userId: studentId } }),
    prisma.teacherProfile.findUniqueOrThrow({ where: { userId: teacherId } }),
  ]);

  const outsideTitles = [
    ['Personal Notebook', 'Demo Student'],
    ['Machine Learning Notes', 'Demo Student'],
    ['Project Design Journal', 'Demo Student'],
  ] as const;

  for (const [index, [title, author]] of outsideTitles.entries()) {
    const existing = await prisma.outsideBookEntry.findFirst({
      where: { studentId: studentProfile.id, title },
      select: { id: true },
    });
    if (!existing) {
      await prisma.outsideBookEntry.create({
        data: {
          studentId: studentProfile.id,
          title,
          author,
          studentRegNumberSnapshot: studentProfile.studentRegNumber,
          studentDepartmentSnapshot: studentProfile.department,
          studentSemesterSnapshot: studentProfile.currentSemester,
          entryStatus: index === 0 ? OutsideBookEntryStatus.ENTERED : OutsideBookEntryStatus.EXITED,
          isVerifiedEntry: true,
          isVerifiedExit: index !== 0,
          exitTime: index === 0 ? undefined : new Date(),
        },
      });
    }
  }

  if ((await prisma.loan.count()) === 0) {
    const now = new Date();
    const returnedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const issuedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const dueAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.loan.createMany({
      data: [
        {
          bookId: demoBooks[0].id,
          userId: studentId,
          borrowerRole: Role.STUDENT,
          issuedById: adminId,
          issuedAt,
          dueAt,
          status: LoanStatus.ACTIVE,
        },
        {
          bookId: demoBooks[1].id,
          userId: teacherId,
          borrowerRole: Role.TEACHER,
          issuedById: adminId,
          issuedAt,
          dueAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
          facultySignatureText: teacherProfile.signatureData ?? 'Demo Teacher',
          facultySignatureRecordedAt: issuedAt,
          status: LoanStatus.ACTIVE,
        },
        {
          bookId: demoBooks[2].id,
          userId: studentId,
          borrowerRole: Role.STUDENT,
          issuedById: adminId,
          returnedById: adminId,
          issuedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
          dueAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
          returnedAt,
          status: LoanStatus.RETURNED,
        },
      ],
    });

    await prisma.book.update({ where: { id: demoBooks[0].id }, data: { availableCopies: Math.max(0, demoBooks[0].totalCopies - 1) } });
    await prisma.book.update({ where: { id: demoBooks[1].id }, data: { availableCopies: Math.max(0, demoBooks[1].totalCopies - 1) } });
  }

  if ((await prisma.auditLog.count({ where: { action: 'demo.seed' } })) === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: adminId,
          actorRole: Role.ADMIN,
          action: 'demo.seed',
          entityType: 'System',
          metadata: { note: 'Demo data seeded for IICT LMS' },
        },
        {
          actorId: adminId,
          actorRole: Role.ADMIN,
          action: 'book.create',
          entityType: 'Book',
          entityId: demoBooks[0].id,
          metadata: { accessionNumber: demoBooks[0].accessionNumber },
        },
      ],
    });
  }
}

async function main() {
  const { admin, student, teacher } = await ensureUser();
  const demoBooks = await seedBooks();
  await seedActivity(student.id, teacher.id, admin.id, demoBooks);

  console.log('Demo data ready.');
  console.log('Admin: admin.demo@iict.local / Admin@12345');
  console.log('Student: student.demo@iict.local / Student@12345');
  console.log('Teacher: teacher.demo@iict.local / Teacher@12345');
  console.log(`Books available: ${await prisma.book.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
