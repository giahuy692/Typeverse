export enum ContentType {
  Quote = 'quote',
  Paragraph = 'paragraph',
  WordList = 'wordlist',
  Custom = 'custom'
}

export const mockContents = {
  [ContentType.Quote]: `Chỉ có những người đi quá xa mới biết họ có thể đi bao xa.`,
  [ContentType.Paragraph]: `Việc luyện gõ phím nhanh không chỉ giúp bạn tăng hiệu suất làm việc mà còn nâng cao khả năng tư duy logic.`,
  [ContentType.WordList]: `angular tailwind component module typing layout keyboard developer`,
};
