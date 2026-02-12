import PreviewComponent from "@/components/previewComponent";
import Types from "../list";

export default async function Page({ params, searchParams }: any) {
  // Await params in Next.js 15+
  const resolvedParams = await params;
  const selectedType = Types.find((type) => type.component === resolvedParams.inators);

  //  console.log(selectedType?.types)

  return (
    <div>
      {selectedType?.types.map((type, index) => {
        return (
          <PreviewComponent
            code={type?.code}
            installation={type?.installation}
            key={index}
          >
            {type?.component}
          </PreviewComponent>
        );
      })}
    </div>
  );
}
