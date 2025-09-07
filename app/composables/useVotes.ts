import { ref } from "vue"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

type VoteData = {
  userEmail: string
  contestantId: string
  votes: number
  amountPaid: number
  paymentMethod: string,
	category: string,
  proofFile?: String | null
}

export function useVotes() {
  const { $db, $storage } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const submitVote = async (vote: VoteData) => {
    loading.value = true
    error.value = null

    try {
      // Prepare Firestore document
      const voteRecord: any = {
        userEmail: vote.userEmail,
        contestantId: vote.contestantId,
        votes: vote.votes,
        amountPaid: vote.amountPaid,
        paymentMethod: vote.paymentMethod,
				category: vote.category,
				proofFileName: vote.proofFile,
        createdAt: serverTimestamp()
      }

      // Save to Firestore
      await addDoc(collection($db, "votes"), voteRecord)

      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Failed to submit vote"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return { submitVote, loading, error }
}
