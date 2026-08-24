import { Role } from '@/lib/generated/prisma/enums';
import {
  LayoutDashboard,
  UserCog,
  BookOpenIcon,
  ClipboardList,
  ClipboardCheck,
  CalendarCheck2,
  BookPlus,
  FileCheck,
  Target,
  GraduationCap,
} from 'lucide-react';
import { FaChalkboard, FaUsers } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';

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
      url: '/dashboard/academic',
      icon: GraduationCap,
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
      title: 'Koordinator',
      url: '/dashboard/profile',
      icon: ImProfile,
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
          title: 'Riwayat Setoran',
          url: '/dashboard/submission',
          icon: BookOpenIcon,
        },
        {
          title: 'Riwayat Aktivitas Rumah',
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
      title: 'Guru',
      url: '/dashboard/profile',
      icon: ImProfile,
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
          title: 'Input Target Setoran',
          url: '/dashboard/weekly-target/input',
          icon: Target,
        },
        {
          title: 'Riwayat Target Setoran',
          url: '/dashboard/weekly-target/history',
          icon: BookOpenIcon,
        },
        {
          title: 'Input Setoran',
          url: '/dashboard/submission/input',
          icon: BookPlus,
        },
        {
          title: 'Riwayat Setoran',
          url: '/dashboard/submission/history',
          icon: BookOpenIcon,
        },
        {
          title: 'Riwayat Aktivitas Rumah',
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
      title: 'Siswa',
      url: '/dashboard/profile',
      icon: ImProfile,
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
          title: 'Riwayat Setoran',
          url: '/dashboard/submission',
          icon: BookOpenIcon,
        },
        {
          title: 'Input Aktivitas Rumah',
          url: '/dashboard/home-activity/input',
          icon: BookPlus,
        },
        {
          title: 'Riwayat Aktivitas Rumah',
          url: '/dashboard/home-activity/history',
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
