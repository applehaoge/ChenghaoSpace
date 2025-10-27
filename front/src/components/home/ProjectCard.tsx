import { toast } from 'sonner';
import { aiService } from '@/api/aiService';

export type ProjectCardProps = {
  title: string;
  imageUrl: string;
  bgColor: string;
  projectId: string;
};

export function ProjectCard({ title, imageUrl, bgColor, projectId }: ProjectCardProps) {
  const handleClick = async () => {
    try {
      const loadingToast = toast.loading(`正在加载${title}项目详情...`);
      const response = await aiService.getProjectDetails(projectId);
      toast.dismiss(loadingToast);

      if (response.success && response.project) {
        toast.success(`成功加载${title}项目详情`);
        console.log('项目详情:', response.project);
      } else {
        toast.error(response.error || '加载项目详情失败');
      }
    } catch (error) {
      console.error('项目卡片点击错误:', error);
      toast.error('加载项目详情时发生错误');
    }
  };

  return (
    <div
      className="h-[180px] rounded-lg overflow-hidden relative border border-gray-200 shadow-sm bg-gray-100 group cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <img
          src={imageUrl}
          alt={title}
          className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h4 className="absolute bottom-4 left-4 right-4 m-0 p-2 bg-black/60 text-white text-sm rounded">
        {title}
      </h4>
    </div>
  );
}
