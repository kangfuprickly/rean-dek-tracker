
export default function ExportLegend() {
  return (
    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
      <p className="font-medium mb-1">รูปแบบสัญลักษณ์ในรายงาน:</p>
      <p>• <strong>/</strong> = มาเรียน</p>
      <p>• <strong>x</strong> = ขาดเรียน</p>
      <p>• <strong>เว้นว่าง</strong> = ยังไม่เช็ค</p>
    </div>
  );
}
