import { EmergencyServiceData } from "@/hooks/useEmergencyServices";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({
  svc,
  children,
}: {
  svc: EmergencyServiceData;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: svc.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default SortableItem;
