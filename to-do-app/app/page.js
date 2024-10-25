// app/page.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import TodoList from "@/components/TodoList"
import { redirect } from "next/navigation"

export const metadata = {
  title: 'To-Do List App',
  description: 'A simple to-do list application',
};

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <main className="container mx-auto">
        <TodoList />
      </main>
    </div>
  );
}
