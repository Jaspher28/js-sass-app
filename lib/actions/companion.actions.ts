"use server"
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const {userId: author} = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
    .from("companions")
    .insert({...formData, author})
    .select()

    if(error || !data) throw new Error(error?.message || "Failed to create a companion");

    return data[0];
}

export const getAllCompanions = async({ limit = 10, page = 1, subject, topic} : GetAllCompanions) =>{
    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject',`%${subject}%`)
        .or(`'topic.ilike.%${topic}%, name.ilike.%${topic}%`)
    }  else if(subject){
        query = query.ilike('subject', `%${subject}%`);
    }else if(topic){
        query = query.or(`topic.ilike.%${topic}%, name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const {data: companions, error} = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions')
        .select()
        .eq("id", id);
    
    if(error) return console.log(error);

    return data[0];
}

// export const addToSessionHistory = async (companionId : string) => {
//     const { userId } = await auth()
//     const supabase = createSupabaseClient();

//     const {data, error} = await supabase
//     .from('session_history')
//     .insert({
//         companion_id : companionId,
//         user_id : userId,
//     })

//     if(error) throw new Error(error.message);

//     return data;
// }
export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  const supabase = createSupabaseClient();

  // Step 1: Delete existing record for same user & companion
  const { error: deleteError } = await supabase
    .from('session_history')
    .delete()
    .eq('user_id', userId)
    .eq('companion_id', companionId);

  if (deleteError) throw new Error(deleteError.message);

  // Step 2: Insert new session row
  const { data, error: insertError } = await supabase
    .from('session_history')
    .insert({
      companion_id: companionId,
      user_id: userId,
    });

  if (insertError) throw new Error(insertError.message);

  return data;
};


export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
    .from('session_history')
    .select(`companions:companion_id(*)`)
    .order('created_at', {ascending: false})
    .limit(limit)
    
    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string ,limit = 10) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase.from('session_history')
    .select(`companions:companion_id (*)`)
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .limit(10)
    
    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions)
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase.from('companions')
    .select()
    .eq('author', userId)
    
    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const {userId, has } = await auth();
    const supabase = createSupabaseClient()

    let limit = 0;

    if(has({plan: 'pro'})){
        return true
    }else if(has({feature: '3_companion_limit'})){
        limit = 3;
    }else if(has({feature:'10_companion_limit'})){
        limit = 10;
    }

    const {data, error} = await supabase
        .from('companions')
        .select('id',{count: 'exact'})
        .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit){
        return false;
    }else{
        return true
    }
}


export const addBookmark = async (companionId: string, path: string) => {
    const {userId} = await auth();
    if(!userId) return;

    const supabase = createSupabaseClient();
    const {data, error} = await supabase
        .from('bookmarks')
        .insert({
            companion_id : companionId,
            user_id : userId,
        });
        if(error) throw new Error(error.message)
        
        revalidatePath(path)
        return data
}

export const removeBookmark = async (companionId: string, path: string) => {
    const {userId} = await auth();
    if(!userId) return;

    const supabase = createSupabaseClient();
    const {data, error} = await supabase
        .from('bookmarks')
        .delete()
        .eq("companion_id", companionId)
        .eq("user_id", userId)

    if(error) throw new Error(error.message);
    
    revalidatePath(path)
    return data;
}

export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = await createSupabaseClient();
    const {data, error} = await supabase
        .from('bookmarks')
        .select(`companions: companion_id(*)`)
        .eq('user_id', userId)

    if(error) throw new Error(error.message);

    return data.map(({companions}) => companions)
}

// export const addBookmark = async (companionId: string, path : string) => {
//     const {userId} = await auth();
//     if(!userId) return;
//     const supabase = createSupabaseClient();
//     const {data, error} = await supabase
//         .from('bookmarks')
//         .insert({
//             companion_id: companionId,
//             user_id: userId,
//         });
        
//         if(error) {
//             throw new Error(error.message)
//         }
//         revalidatePath(path)
//         return data;   
// }
// export const addingBookmark = async () => {
//     const { userId } = await auth();
//     console.log(userId);
// }
// addingBookmark()

// export const addBookmark = async (companionId: string, path: string) => {
//   const { userId } = await auth();
//   if (!userId) return;

//   const supabase = createSupabaseClient();

//   // ✅ Step 1: Check if this bookmark already exists
//   const { data: existing, error: checkError } = await supabase
//     .from("bookmarks")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("companion_id", companionId)
//     .maybeSingle(); // Use maybeSingle to avoid throwing if no result

//   if (checkError) {
//     throw new Error(checkError.message);
//   }

//   if (existing) {
//     console.log("✅Bookmark already exists. Skipping insert.");
//     return existing;
//   }

//   // ✅ Step 2: If not exists, insert it
//   const { data, error } = await supabase.from("bookmarks").insert({
//     companion_id: companionId,
//     user_id: userId,
//   });

//   if (error) {
//     throw new Error(error.message);
//   }

//   revalidatePath(path);
//   return data;
// };


// export const removeBookmark = async (companionId: string, path: string) => {
//     const {userId} = await auth();
//     if(!userId) return;
//     const supabase = createSupabaseClient();
//     const {data, error} = await supabase
//         .from('bookmarks')
//         .delete()
//         .eq("companion_id", companionId)
//         .eq("user_id", userId)
    
//     if(error){
//         throw new Error(error.message)
//     };
//     revalidatePath(path);
//     return data;
// }

// export const getBookmarkedCompanions = async (userId: string) => {
//     const supabase = await createSupabaseClient();
//     const {data, error} = await supabase
//         .from('bookmarks')
//         .select(`companions:companion_id(*)`)
//         .eq('user_id', userId)

//     if(error){
//         throw new Error (error.message)
//     };
    
//     return data.map(({companions}) => companions)
// }

