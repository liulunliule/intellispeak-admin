// Định nghĩa cho các loại file tĩnh
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Định nghĩa cho module assets
declare module '@/assets' {
  const content: {
    // Thêm các exports cụ thể nếu cần
    logo: string;
    // ... các assets khác
  };
  export default content;
}