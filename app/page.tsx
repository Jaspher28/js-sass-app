  import CompanionCard from '@/components/CompanionCard'
  import CompanionsList from '@/components/CompanionsList'
import CTA from '@/components/CTA'
import { getAllCompanions, getRecentSessions } from '@/lib/actions/companion.actions'
import { getSubjectColor } from '@/lib/utils'
import { auth } from "@clerk/nextjs/server";
import React from 'react'

const Page = async () => {
  const { userId } = await auth();
  const companions = await getAllCompanions({ limit: 3 });

  // //Get bookmarked companions for this user
  // const bookmarked = userId ? await getBookmarkedCompanions(userId) : [];
  // const bookmarkedIds = bookmarked.map((c) => c.id);

  // // Mark each companion as bookmarked if it's in that list
  // const companionsWithBookmark = companions.map(comp => ({
  //   ...comp,
  //   bookmarked: bookmarkedIds.includes(comp.id),
  // }));

  const recentSessionCompanions = await getRecentSessions(10);

  return (
    <main>
      <h1>Popular Companions</h1>
      <section className='home-section'>
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      <section className='home-section'>
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessionCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
}

export default Page;
