// src/assets/mock-data/writing-prompts.ts

export interface WritingPrompt {
  id: number;
  title: string;
  content: string;
  audioPath?: string;
  contentVN?: string;
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
    audioPath: 'assets/audio/email_informal.mp3',
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
              Finally, I think the club should consider carefully before making any decision. I believe the club because the club always wants the best for members.
              Here are all of my ideas. I look forward to your reply.
              Best regards,
              Huy.`,
    audioPath: 'assets/audio/email_formal.mp3',
    contentVN: `Kính gửi Chủ tịch, Thưa ngài, Quản lý, Thưa bà, <br/>
                Tôi tên là Hùng, một thành viên của câu lạc bộ. Hôm qua, tôi đã nhận được một email từ câu lạc bộ và tôi viết email này để hồi đáp thông báo mới nhất từ câu lạc bộ  <br/>
                tôi cảm thấy rất vui khi nghe tin này vì tôi rất mong đợi nó  <br/>
                tôi cảm thấy buồn khi nghe tin này vì tôi không mong đợi nó xảy ra.  <br/>
                Tôi gợi ý câu lạc bộ nên tổ chức một cuộc họp trực tuyến hoặc một cuộc họp trực tiếp cho các thành viên của mình. Điều này sẽ tạo cơ hội cho nhiều thành viên tham gia và bày tỏ ý kiến của họ hơn. Sau đó, tôi tin rằng việc câu lạc bộ gửi một món quà nhỏ hoặc hoa cho các thành viên sẽ là một cử chỉ chu đáo. Điều này sẽ giúp các thành viên cảm thấy vui vẻ và gắn kết hơn với câu lạc bộ.  <br/>
                Cuối cùng, tôi nghĩ câu lạc bộ nên cân nhắc kỹ trước khi đưa ra bất kỳ quyết định. Tôi tin tưởng vào câu lạc bộ vì tôi biết râng câu lạc bộ luôn muốn đem đến những điều tốt nhất của các thành viên.  <br/>
                Đây là những ý kiến của tôi. Tôi rất mong nhận được phản hồi từ bạn`
  },
];
