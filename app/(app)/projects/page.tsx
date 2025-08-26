import { Button, Table } from "@/components/ui";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p>У вас пока нет проектов</p>
        <Button>Создать проект</Button>
      </div>
      <Table headers={["Название", "Статус", "Дата"]}>
        <tr>
          <td className="py-2">Проект A</td>
          <td>—</td>
          <td>—</td>
        </tr>
      </Table>
    </div>
  );
}
