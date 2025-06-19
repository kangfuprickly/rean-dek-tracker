
// Static data for export form options
export const gradeOptions = Array.from({ length: 6 }, (_, i) => ({
  value: `ม.${i + 1}`,
  label: `ม.${i + 1}`
}));

export const monthOptions = [
  { value: '01', label: 'มกราคม', days: 31 },
  { value: '02', label: 'กุมภาพันธ์', days: 28 },
  { value: '03', label: 'มีนาคม', days: 31 },
  { value: '04', label: 'เมษายน', days: 30 },
  { value: '05', label: 'พฤษภาคม', days: 31 },
  { value: '06', label: 'มิถุนายน', days: 30 },
  { value: '07', label: 'กรกฎาคม', days: 31 },
  { value: '08', label: 'สิงหาคม', days: 31 },
  { value: '09', label: 'กันยายน', days: 30 },
  { value: '10', label: 'ตุลาคม', days: 31 },
  { value: '11', label: 'พฤศจิกายน', days: 30 },
  { value: '12', label: 'ธันวาคม', days: 31 }
];

export const getClassroomOptions = (selectedGrade: string) => {
  return selectedGrade ? Array.from({ length: 10 }, (_, i) => ({
    value: `${selectedGrade}/${i + 1}`,
    label: `${selectedGrade}/${i + 1}`
  })) : [];
};
