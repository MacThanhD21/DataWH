import Header from "@/components/layout/Header";
import Wrapper from "@/components/layout/Wrapper";
import { TableDWH } from "@/components/ui/Table_DWH";

export default function Home() {
  return (
    <>
      <Header></Header>
      <main>
        <div className="text-white">
          <Wrapper>
            <TableDWH></TableDWH>
          </Wrapper>
        </div>
      </main>
    </>
  );
}
