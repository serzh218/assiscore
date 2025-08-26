import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Table } from "@/components/ui";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FREE</CardTitle>
        </CardHeader>
        <CardContent>Баланс токенов: ХХХ</CardContent>
        <CardFooter className="flex gap-4">
          <Button>Купить токены</Button>
          <Button variant="secondary">Перейти на PRO</Button>
        </CardFooter>
      </Card>
      <Table headers={["Преимущество", "FREE", "PRO"]}>
        <tr>
          <td className="py-2">Больше лимитов</td>
          <td>—</td>
          <td>✔</td>
        </tr>
      </Table>
    </div>
  );
}
