import CompanionForm from "@/components/CompanionForm"

const NewCompanion = () => {
  return (
    <main className="md:w-2/3 lg:w-2/5 items-center justify-center">
      <article className="w-full gap-4 flex flex-col">
        <h1>Companion Builder</h1>
        <CompanionForm/>
      </article>
    </main>
  )
}

export default NewCompanion