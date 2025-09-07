import { ref } from "vue"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

type VoteData = {
  userEmail: string
  contestantId: string
  votes: number
  amountPaid: number
  paymentMethod: string,
	category: string,
  proofFile?: File | null
}

export function useVotes() {
  const { $db, $storage } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const submitVote = async (vote: VoteData) => {
    loading.value = true
    error.value = null

    try {
      let proofUrl: string | null = null

      // Upload proof only if file is provided
      if (vote.proofFile) {
        const filePath = `proofs/${Date.now()}_${vote.proofFile.name}`
        const fileRef = storageRef($storage as import("firebase/storage").FirebaseStorage, filePath)
        await uploadBytes(fileRef, vote.proofFile)
        proofUrl = await getDownloadURL(fileRef)
      }

      // Prepare Firestore document
      const voteRecord: any = {
        userEmail: vote.userEmail,
        contestantId: vote.contestantId,
        votes: vote.votes,
        amountPaid: vote.amountPaid,
        paymentMethod: vote.paymentMethod,
				category: vote.category,
        createdAt: serverTimestamp()
      }

      if (proofUrl) {
        voteRecord.proof = proofUrl
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
