 // 图片容器组件
 const EmojiContainer = ({ src, alt }: { src: string; alt: string }) => (
    <div className="aspect-square rounded-2xl bg-muted/60 p-4 flex items-center justify-center overflow-hidden">
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain"
      />
    </div>
  );

  export default EmojiContainer;