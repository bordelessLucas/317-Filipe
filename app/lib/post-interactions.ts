import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  collection,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebaseconfig';

// Validação do db - apenas log, não bloqueia
if (!db) {
  console.warn('⚠️ Firebase db não está disponível. Algumas funcionalidades podem não funcionar.');
}

export interface PostInteraction {
  postId: string;
  userId: string;
  type: 'like' | 'repost' | 'inspiration' | 'save';
  reaction?: string;
  createdAt?: any;
}

export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: any;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
  parentCommentId?: string;
}

/**
 * Toggle like em um post
 */
export async function toggleLikePost(postId: string, userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    // Retorna false mas não quebra o app
    return false;
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    // Se o post não existe, cria ele primeiro
    if (!postDoc.exists()) {
      await setDoc(postRef, {
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        inspirationsCount: 0,
        createdAt: serverTimestamp()
      });
    }
    
    // Agora cria a subcoleção de likes
    const likesCollection = collection(postRef, 'likes');
    const likeRef = doc(likesCollection, userId);
    const likeDoc = await getDoc(likeRef);
    
    if (likeDoc.exists()) {
      // Remove o like
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1)
      });
      return false;
    } else {
      // Adiciona o like
      await setDoc(likeRef, {
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    // Se falhar, tenta uma abordagem alternativa usando um campo array
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        await setDoc(postRef, {
          likes: [],
          likesCount: 0,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          likesCount: increment(1)
        });
        return true;
      }
      
      const currentLikes = postDoc.data()?.likes || [];
      const hasLiked = currentLikes.includes(userId);
      
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
          likesCount: increment(-1)
        });
        return false;
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          likesCount: increment(1)
        });
        return true;
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Verifica se o usuário curtiu o post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return false;
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return false;
    }
    
    // Tenta verificar na subcoleção primeiro
    try {
      const likeRef = doc(collection(postRef, 'likes'), userId);
      const likeDoc = await getDoc(likeRef);
      if (likeDoc.exists()) return true;
    } catch {
      // Se falhar, verifica no array
    }
    
    // Verifica no array de likes
    const postData = postDoc.data();
    const likes = postData?.likes || [];
    return likes.includes(userId);
  } catch (error) {
    console.error('Error checking like:', error);
    return false;
  }
}

/**
 * Adiciona um comentário a um post
 */
export async function addCommentToPost(
  postId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  text: string,
  parentCommentId?: string
): Promise<string> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    throw new Error('Firebase não está configurado. Por favor, configure as variáveis de ambiente do Firebase.');
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    // Se o post não existe, cria ele primeiro
    if (!postDoc.exists()) {
      await setDoc(postRef, {
        commentsCount: 0,
        likesCount: 0,
        repostsCount: 0,
        inspirationsCount: 0,
        createdAt: serverTimestamp()
      });
    }
    
    // Cria a subcoleção de comentários
    const commentsRef = collection(postRef, 'comments');
    
    // Remove campos undefined (Firestore não aceita undefined)
    // Converte undefined para null ou remove o campo
    const commentData: any = {
      postId,
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      parentCommentId: parentCommentId || null
    };
    
    // Adiciona userAvatar apenas se tiver valor (não undefined)
    // Se for null, pode incluir, mas undefined não
    if (userAvatar !== undefined) {
      commentData.userAvatar = userAvatar || null;
    }
    
    const docRef = await addDoc(commentsRef, commentData);
    
    // Atualiza contador de comentários no post
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Busca comentários de um post
 */
export async function getPostComments(postId: string, limitCount: number = 50): Promise<Comment[]> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return [];
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const commentsRef = collection(postRef, 'comments');
    
    // Busca comentários principais (sem parent)
    const q = query(
      commentsRef,
      where('parentCommentId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const comments: Comment[] = [];
    
    for (const docSnap of snapshot.docs) {
      const commentData = docSnap.data();
      const comment: Comment = {
        commentId: docSnap.id,
        ...commentData,
        createdAt: commentData.createdAt
      } as Comment;
      
      // Busca respostas
      try {
        const repliesQuery = query(
          commentsRef,
          where('parentCommentId', '==', docSnap.id),
          orderBy('createdAt', 'asc')
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        comment.replies = repliesSnapshot.docs.map(replyDoc => ({
          commentId: replyDoc.id,
          ...replyDoc.data(),
          createdAt: replyDoc.data().createdAt
        } as Comment));
      } catch (replyError) {
        comment.replies = [];
      }
      
      comments.push(comment);
    }
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Repost (Echo) de um post
 */
export async function repostPost(postId: string, userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return false;
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    // Se o post não existe, cria ele primeiro
    if (!postDoc.exists()) {
      await setDoc(postRef, {
        repostsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        inspirationsCount: 0,
        createdAt: serverTimestamp()
      });
    }
    
    // Cria a subcoleção de reposts
    const repostsCollection = collection(postRef, 'reposts');
    const repostRef = doc(repostsCollection, userId);
    const repostDoc = await getDoc(repostRef);
    
    if (repostDoc.exists()) {
      // Remove repost
      await deleteDoc(repostRef);
      await updateDoc(postRef, {
        repostsCount: increment(-1)
      });
      return false;
    } else {
      // Adiciona repost
      await setDoc(repostRef, {
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        repostsCount: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error('Error reposting:', error);
    throw error;
  }
}

/**
 * Adiciona inspiração a um post
 */
export async function addInspirationToPost(postId: string, userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return false;
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    // Se o post não existe, cria ele primeiro
    if (!postDoc.exists()) {
      await setDoc(postRef, {
        inspirationsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        createdAt: serverTimestamp()
      });
    }
    
    // Cria a subcoleção de inspirações
    const inspirationsCollection = collection(postRef, 'inspirations');
    const inspirationRef = doc(inspirationsCollection, userId);
    const inspirationDoc = await getDoc(inspirationRef);
    
    if (inspirationDoc.exists()) {
      await deleteDoc(inspirationRef);
      await updateDoc(postRef, {
        inspirationsCount: increment(-1)
      });
      return false;
    } else {
      await setDoc(inspirationRef, {
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        inspirationsCount: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error('Error adding inspiration:', error);
    throw error;
  }
}

/**
 * Salva um post
 */
export async function savePost(postId: string, userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return false;
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    // Se o usuário não existe, cria ele primeiro
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        savedPosts: [],
        createdAt: serverTimestamp()
      });
    }
    
    // Cria a subcoleção de posts salvos
    const savedPostsCollection = collection(userRef, 'savedPosts');
    const saveRef = doc(savedPostsCollection, postId);
    const saveDoc = await getDoc(saveRef);
    
    if (saveDoc.exists()) {
      await deleteDoc(saveRef);
      return false;
    } else {
      await setDoc(saveRef, {
        postId,
        savedAt: serverTimestamp()
      });
      return true;
    }
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

/**
 * Busca todos os posts curtidos por um usuário
 */
export async function getUserLikedPosts(userId: string): Promise<string[]> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return [];
  }
  
  try {
    // Busca em todos os posts que têm likes
    const postsRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsRef);
    const likedPostIds: string[] = [];
    
    for (const postDoc of postsSnapshot.docs) {
      const postId = postDoc.id;
      const likesRef = collection(postDoc.ref, 'likes');
      const likeDoc = await getDoc(doc(likesRef, userId));
      
      if (likeDoc.exists()) {
        likedPostIds.push(postId);
      }
    }
    
    return likedPostIds;
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return [];
  }
}

/**
 * Busca todos os posts repostados por um usuário
 */
export async function getUserRepostedPosts(userId: string): Promise<string[]> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return [];
  }
  
  try {
    const postsRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsRef);
    const repostedPostIds: string[] = [];
    
    for (const postDoc of postsSnapshot.docs) {
      const postId = postDoc.id;
      const repostsRef = collection(postDoc.ref, 'reposts');
      const repostDoc = await getDoc(doc(repostsRef, userId));
      
      if (repostDoc.exists()) {
        repostedPostIds.push(postId);
      }
    }
    
    return repostedPostIds;
  } catch (error) {
    console.error('Error fetching reposted posts:', error);
    return [];
  }
}

/**
 * Busca todos os posts salvos por um usuário
 */
export async function getUserSavedPosts(userId: string): Promise<string[]> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return [];
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const savedPostsRef = collection(userRef, 'savedPosts');
    const savedPostsSnapshot = await getDocs(savedPostsRef);
    
    return savedPostsSnapshot.docs.map(doc => doc.data().postId);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return [];
  }
}

/**
 * Busca informações completas de um post pelo ID
 */
export async function getPostById(postId: string): Promise<any | null> {
  if (!db) {
    console.error('Firebase db não está inicializado');
    return null;
  }
  
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return null;
    }
    
    return {
      id: postDoc.id,
      ...postDoc.data()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}
