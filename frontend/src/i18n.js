import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            dashboard: 'Dashboard',
            assets: 'Assets',
            maintenance: 'Asset Maintenance',
            locations: 'Locations',
            people: 'People',
            reports: 'Reports',
            settings: 'Settings'
          },
          dashboard: {
            title: 'Dashboard Overview',
            subtitle: 'Summary of Carrollprep school equipment',
            stats: {
              total_assets: 'Total Assets',
              borrowed: 'Borrowed',
              locations: 'Locations',
              maintenance: 'Pending Maintenance',
              inventory_desc: 'Inventory',
              in_use_desc: 'In-Use',
              facilities_desc: 'Facilities',
              service_desc: 'Service'
            },
            activity: {
              title: 'Recent Activity',
              new_asset: 'New Asset Added',
              borrowed: 'Asset Borrowed',
              time_ago: '{{count}}h ago'
            },
            warranty: {
              title: 'Warranty Alerts',
              normal: 'All Systems Normal',
              no_expiring: 'No assets with expiring warranty this month'
            }
          },
          assets: {
            title: 'Assets',
            add_button: 'ADD ASSET',
            search_placeholder: 'Search Assets...',
            table: {
              info: 'Asset Info',
              status: 'Status',
              category: 'Tag/Category',
              owner_loc: 'Owner/Loc',
              location: 'Location',
              dates: 'Dates',
              actions: 'Actions'
            },
            status: {
              available: 'Available',
              borrow: 'Borrow',
              maintenance: 'Maintenance',
              eol: 'End of Life',
              pending: 'Pending Disposal'
            },
            alerts: {
              delete_confirm: 'Are you sure?',
              delete_text: 'You will not be able to recover this asset!',
              delete_success: 'Deleted!',
              delete_error: 'Delete failed - item may be locked',
              save_success: 'Asset saved successfully',
              action_failed: 'Action failed'
            }
          },
          maintenance: {
            title: 'Asset Maintenance',
            subtitle: 'Tracking repairs, upgrades, and inspections',
            schedule_button: 'SCHEDULE SERVICE',
            loading: 'Loading maintenance logs...',
            status: {
              completed: 'Completed',
              in_progress: 'In Progress',
              pending: 'Pending'
            },
            view_log: 'View Full Log',
            cost: 'Cost'
          },
          locations: {
            title: 'Locations & Facilities',
            subtitle: 'Manage school rooms, labs, and storage areas',
            add_button: 'ADD LOCATION',
            table: {
              name: 'Location Name',
              type: 'Type',
              assets: 'Assets Count',
              status: 'Status'
            }
          },
          people: {
            title: 'People & Departments',
            subtitle: 'Manage asset owners and staff members',
            add_button: 'ADD PERSON',
            table: {
              name: 'Name',
              dept: 'Department',
              role: 'Role',
              assets: 'Assigned Assets'
            }
          },
          modal: {
            add_title: 'Add New Record',
            edit_title: 'Edit Record',
            name: 'Name',
            tag: 'Asset Tag',
            category: 'Category',
            status: 'Status',
            owner: 'Owner',
            location: 'Location',
            start_date: 'Procurement Date',
            warranty_date: 'Warranty Due Date',
            cancel: 'Cancel',
            create: 'Create',
            save: 'Save Changes',
            select_owner: 'Select Owner',
            select_location: 'Select Location'
          }
        }
      },
      th: {
        translation: {
          nav: {
            dashboard: 'แดชบอร์ด',
            assets: 'รายการสินทรัพย์',
            maintenance: 'การบำรุงรักษา',
            locations: 'สถานที่',
            people: 'บุคลากร',
            reports: 'รายงาน',
            settings: 'ตั้งค่า'
          },
          dashboard: {
            title: 'ภาพรวมระบบ',
            subtitle: 'สรุปข้อมูลอุปกรณ์ของ Carrollprep',
            stats: {
              total_assets: 'สินทรัพย์ทั้งหมด',
              borrowed: 'ถูกยืมไป',
              locations: 'จำนวนสถานที่',
              maintenance: 'รอซ่อมบำรุง',
              inventory_desc: 'คลังสินค้า',
              in_use_desc: 'ใช้งานอยู่',
              facilities_desc: 'สิ่งอำนวยความสะดวก',
              service_desc: 'บริการ'
            },
            activity: {
              title: 'กิจกรรมล่าสุด',
              new_asset: 'เพิ่มสินทรัพย์ใหม่',
              borrowed: 'ยืมสินทรัพย์',
              time_ago: '{{count}} ชม. ที่แล้ว'
            },
            warranty: {
              title: 'แจ้งเตือนประกัน',
              normal: 'ระบบปกติ',
              no_expiring: 'ไม่มีสินทรัพย์ที่กำลังหมดประกันในเดือนนี้'
            }
          },
          assets: {
            title: 'สินทรัพย์',
            add_button: 'เพิ่มสินทรัพย์',
            search_placeholder: 'ค้นหาสินทรัพย์...',
            table: {
              info: 'ข้อมูลสินทรัพย์',
              status: 'สถานะ',
              category: 'แท็ก/หมวดหมู่',
              owner_loc: 'เจ้าของ/สถานที่',
              location: 'สถานที่จัดเก็บ',
              dates: 'วันที่สำคัญ',
              actions: 'จัดการ'
            },
            status: {
              available: 'ว่าง',
              borrow: 'ยืม',
              maintenance: 'ซ่อมบำรุง',
              eol: 'หมดอายุการใช้งาน',
              pending: 'รอจำหน่าย'
            },
            alerts: {
              delete_confirm: 'คุณแน่ใจหรือไม่?',
              delete_text: 'คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!',
              delete_success: 'ลบเรียบร้อยแล้ว!',
              delete_error: 'การลบล้มเหลว - ไอเทมอาจถูกล็อคไว้',
              save_success: 'บันทึกข้อมูลสินทรัพย์เรียบร้อย',
              action_failed: 'การดำเนินการล้มเหลว'
            }
          },
          maintenance: {
            title: 'การบำรุงรักษาสินทรัพย์',
            subtitle: 'ติดตามการซ่อมแซม การอัปเกรด และการตรวจสอบ',
            schedule_button: 'นัดหมายบริการ',
            loading: 'กำลังโหลดข้อมูลการบำรุงรักษา...',
            status: {
              completed: 'เสร็จสมบูรณ์',
              in_progress: 'กำลังดำเนินการ',
              pending: 'รอการดำเนินการ'
            },
            view_log: 'ดูบันทึกฉบับเต็ม',
            cost: 'ค่าใช้จ่าย'
          },
          locations: {
            title: 'สถานที่และสิ่งอำนวยความสะดวก',
            subtitle: 'จัดการห้องเรียน ห้องแล็บ และพื้นที่เก็บของ',
            add_button: 'เพิ่มสถานที่',
            table: {
              name: 'ชื่อสถานที่',
              type: 'ประเภท',
              assets: 'จำนวนสินทรัพย์',
              status: 'สถานะ'
            }
          },
          people: {
            title: 'บุคลากรและแผนก',
            subtitle: 'จัดการเจ้าของสินทรัพย์และเจ้าหน้าที่',
            add_button: 'เพิ่มบุคลากร',
            table: {
              name: 'ชื่อ-นามสกุล',
              dept: 'แผนก',
              role: 'บทบาท',
              assets: 'สินทรัพย์ที่ถือครอง'
            }
          },
          modal: {
            add_title: 'เพิ่มข้อมูลใหม่',
            edit_title: 'แก้ไขข้อมูล',
            name: 'ชื่อ',
            tag: 'รหัสสินทรัพย์ (Tag)',
            category: 'หมวดหมู่',
            status: 'สถานะ',
            owner: 'ผู้ดูแล/เจ้าของ',
            location: 'สถานที่จัดการ',
            start_date: 'วันที่จัดซื้อ',
            warranty_date: 'วันที่หมดประกัน',
            cancel: 'ยกเลิก',
            create: 'สร้าง',
            save: 'บันทึกการเปลี่ยนแปลง',
            select_owner: 'เลือกเจ้าของ',
            select_location: 'เลือกสถานที่'
          }
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
