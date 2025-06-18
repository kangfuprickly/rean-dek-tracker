
interface SchoolLogoProps {
  className?: string;
}

export default function SchoolLogo({ className = "h-20 w-auto object-contain" }: SchoolLogoProps) {
  return (
    <div className="flex justify-center mb-6">
      <img 
        src="/lovable-uploads/7c8bfb65-dae8-4dd5-b7c2-fd80778d6c16.png" 
        alt="โลโก้โรงเรียน TARBIA CARE" 
        className={className}
      />
    </div>
  );
}
