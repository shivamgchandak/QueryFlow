import QuestionCard from "./QuestionCard";

export default function QuestionList({ questions }) {
  return (
    <div className="space-y-3 mt-4">
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  );
}