import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { getAllCompanions, getBookmarkedCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";


const CompanionsLibrary = async ({searchParams}: SearchParams) => {
  const filters = await searchParams;

  const subject = filters.subject? filters.subject : '' ;
  const topic = filters.topic? filters.topic : '';

  const { userId } = await auth();
  const companions = await getAllCompanions({ subject, topic});
   // ✅ Fetch bookmarks for current user
  const bookmarked = userId ? await getBookmarkedCompanions(userId) : [];
  const bookmarkedIds = bookmarked.map((c) => c.id);

  // ✅ Tag each companion with `bookmarked: true` if needed
  const companionsWithBookmark = companions.map(comp => ({
    ...comp,
    bookmarked: bookmarkedIds.includes(comp.id),
  }));

  console.log(companions)

  return (
    <main>
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <SearchInput/>
          <SubjectFilter/>
        </div>
      </section>
      <section className="companions-grid">
        {companionsWithBookmark.map((companion) => (
          <CompanionCard 
            key={companion.id} 
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
    </main>
  )
}

export default CompanionsLibrary