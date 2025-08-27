import { Button, Table } from "@/components/ui";
import { ProjectCardSkeleton } from "@/components/skeletons";

export default function ProjectsPage() {
  const isLoading = false;
  return (
    <div className="space-y-6">
      {isLoading ? (
        <ProjectCardSkeleton />
      ) : (
        <>
          <div className="space-y-2">
            <p>У вас пока нет проектов</p>
            <Button>Создать сайт</Button>
          </div>
          <Table headers={["Название", "Статус", "Дата"]}>
            <tr>
              <td className="py-2">Проект A</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </Table>
        </>
      )}
    </div>
  );
}
