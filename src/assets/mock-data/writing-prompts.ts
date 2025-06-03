export interface WritingPrompt {
  id: number;
  title: string;
  content: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 1,
    title: 'Phản hồi email từ câu lạc bộ (Dạng thân mật)',
    content: `Dear Hung,
How are you?
I have read an email from the club saying "...". I'm feeling down/ I'm feeling happy. I will think more about it and share with you later. The club should deliver a gift, and flowers to each member's home, making them feel more attached to the club.
Love,
Huy.`,
  },
  {
    id: 2,
    title: 'Phản hồi email từ câu lạc bộ (Dạng trang trọng)',
    content: `Dear Presiden Sir, Manager, Madam,
My name is Huy, a member of the club. Yesterday, I received an email from the club, and I am writing this email in response to the last notification from the club.
To be honest,
* I feel delighted to hear such news because I look forward to it.
* I feel saddened to hear such news because I do not expect it to happen.
I suggest organizing an online meeting or face to face meeting for members. This would allow more people to join and express their opinions. Then, the club could send a small gift or flowers to members making them feel happy and connected to the club.
Finally, I think the club should consider carefully before making any decision. I believe the club because The club always wants the best for members.
Here are all of my ideas. I look forward to your reply.
Best regards,
Huy.`,
  },
];
