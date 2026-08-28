import { Role } from '@/lib/generated/prisma/enums';
import {
  LayoutDashboard,
  UserCog,
  BookOpenIcon,
  ClipboardList,
  ClipboardCheck,
  CalendarCheck2,
  FileCheck,
  Target,
  GraduationCap,
  BookMarked,
} from 'lucide-react';
import { FaChalkboard, FaUsers } from 'react-icons/fa';

type BaseItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  exact?: boolean;
};

type GroupItem = {
  label: string;
  items: BaseItem[];
};

export type RoleKey = Lowercase<Role>;

export type NavItem = BaseItem | GroupItem;

export const menuData: Record<RoleKey, NavItem[]> = {
  superadmin: [
    {
      title: 'Beranda',
      url: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Manajamen Pengguna',
      url: '/dashboard/users',
      icon: UserCog,
    },
    {
      title: 'Manajemen Kelas',
      url: '/dashboard/classrooms',
      icon: FaChalkboard,
    },
    {
      title: 'Kelompok',
      url: '/dashboard/group',
      icon: FaUsers,
    },
    {
      title: 'Akademik',
      url: '/dashboard/academic-settings',
      icon: GraduationCap,
    },
    {
      title: "Data Referensi Qur'an",
      url: '/dashboard/quran-reference',
      icon: BookMarked,
    },
    {
      title: 'Pengaturan Penilaian',
      url: '/dashboard/scoring-settings',
      icon: ClipboardCheck,
    },
  ],
  admin: [
    {
      title: 'Beranda',
      url: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Manajamen Pengguna',
      url: '/dashboard/users',
      icon: UserCog,
    },
    {
      title: 'Manajemen Kelas',
      url: '/dashboard/classrooms',
      icon: FaChalkboard,
    },
    {
      title: 'Akademik',
      url: '/dashboard/academic-settings',
      icon: GraduationCap,
    },
    {
      title: "Data Referensi Qur'an",
      url: '/dashboard/quran-reference',
      icon: BookMarked,
    },
    {
      title: 'Pengaturan Penilaian',
      url: '/dashboard/scoring-settings',
      icon: ClipboardCheck,
    },
  ],
  coordinator: [
    {
      title: 'Beranda',
      url: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Kelompok',
      url: '/dashboard/group',
      icon: FaUsers,
    },
    {
      label: 'Setoran Siswa',
      items: [
        {
          title: 'Setoran',
          url: '/dashboard/submission',
          icon: BookOpenIcon,
        },
        {
          title: 'Aktivitas Rumah',
          url: '/dashboard/home-activity',
          icon: BookOpenIcon,
        },
      ],
    },
    {
      label: 'Tashih',
      items: [
        {
          title: 'Permintaan Tashih',
          url: '/dashboard/tashih/requests',
          icon: ClipboardList,
        },
        {
          title: 'Penjadwalan Tashih',
          url: '/dashboard/tashih/schedules',
          icon: CalendarCheck2,
        },
        {
          title: 'Penilaian Tashih',
          url: '/dashboard/tashih/results',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      label: 'Munaqasyah',
      items: [
        {
          title: 'Permintaan Munaqasyah',
          url: '/dashboard/munaqasyah/requests',
          icon: ClipboardList,
        },
        {
          title: 'Penjadwalan Munaqasyah',
          url: '/dashboard/munaqasyah/schedules',
          icon: CalendarCheck2,
        },
        {
          title: 'Penilaian Munaqasyah',
          url: '/dashboard/munaqasyah/results',
          icon: ClipboardCheck,
        },
      ],
    },
  ],
  teacher: [
    {
      title: 'Beranda',
      url: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Kelompok',
      url: '/dashboard/group',
      icon: FaUsers,
    },
    {
      label: 'Setoran Siswa',
      items: [
        {
          title: 'Target Setoran',
          url: '/dashboard/weekly-target',
          icon: Target,
        },
        {
          title: 'Setoran',
          url: '/dashboard/submission',
          icon: BookOpenIcon,
        },
        {
          title: 'Aktivitas Rumah',
          url: '/dashboard/home-activity',
          icon: BookOpenIcon,
        },
      ],
    },
    {
      label: 'Tashih',
      items: [
        {
          title: 'Pendaftaran Tashih',
          url: '/dashboard/tashih/request',
          icon: ClipboardList,
        },
        {
          title: 'Jadwal Tashih',
          url: '/dashboard/tashih/schedule',
          icon: CalendarCheck2,
        },
        {
          title: 'Hasil Tashih',
          url: '/dashboard/tashih/result',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      label: 'Munaqasyah',
      items: [
        {
          title: 'Pendaftaran Munaqasyah',
          url: '/dashboard/munaqasyah/request',
          icon: ClipboardList,
        },
        {
          title: 'Jadwal Munaqasyah',
          url: '/dashboard/munaqasyah/schedule',
          icon: CalendarCheck2,
        },
        {
          title: 'Penilaian Munaqasyah',
          url: '/dashboard/munaqasyah/assessment',
          icon: ClipboardCheck,
        },
      ],
    },
  ],
  student: [
    {
      title: 'Beranda',
      url: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Rapor',
      url: '/dashboard/report',
      icon: FileCheck,
    },
    {
      label: 'Setoran',
      items: [
        {
          title: 'Target Setoran',
          url: '/dashboard/weekly-target',
          icon: Target,
        },
        {
          title: 'Setoran',
          url: '/dashboard/submission',
          icon: BookOpenIcon,
        },
        {
          title: 'Aktivitas Rumah',
          url: '/dashboard/home-activity',
          icon: BookOpenIcon,
        },
      ],
    },
    {
      label: 'Tashih',
      items: [
        {
          title: 'Jadwal Tashih',
          url: '/dashboard/tashih/schedule',
          icon: CalendarCheck2,
        },
        {
          title: 'Hasil Tashih',
          url: '/dashboard/tashih/result',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      label: 'Munaqasyah',
      items: [
        {
          title: 'Jadwal Munaqasyah',
          url: '/dashboard/munaqasyah/schedule',
          icon: CalendarCheck2,
        },
        {
          title: 'Hasil Munaqasyah',
          url: '/dashboard/munaqasyah/result',
          icon: ClipboardCheck,
        },
      ],
    },
  ],
};
