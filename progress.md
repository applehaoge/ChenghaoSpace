# ��Ŀ���ȼ�¼��PROGRESS.md��
## ����
- ��Ŀ��chenghaoSpace��ǰ����ʵ�ֻ��� UI����һ���ƻ����� RAG��
- Ŀ�꣺��һ������������� demo���������� UI��������ǿ���ɡ��� Provider ֧�֣�OpenAI Ϊ��ѡ���Լ�����������

## ��Ҫ������¼����ʱ�䵹��
### 2025-10-27 17:30 – Conversation switch isolation
- Refactored `ChatInterface` to keep per-conversation message registries (`conversationIdRef`, `messagesRegistryRef`, `updateConversationMessages`) so async replies update the correct thread after task switching, preventing title cross-contamination.
- Streaming updates now reference the captured conversation id; verified with `pnpm run build:client`.

### 2025-10-27 16:45 – Loading toast lifecycle
- Wrapped the “正在开启新聊天...” toast in a `try/finally` to guarantee dismissal even on request failures, fixing the lingering spinner during regular chats.
- Confirmed behaviour via `pnpm run build:client`.

### 2025-10-27 16:10 – Home page modularisation
- Split the monolithic `front/src/pages/Home.tsx` into focused modules (`components/chat`, `components/home`, `components/attachments`, `pages/home`), turning the page into a thin orchestrator.
- Shared types/utils extracted to `front/src/pages/home`, while uploads, sidebar, and main content became reusable components; existing UX preserved.
- Build still succeeds (`pnpm run build:client`).

### 2025-10-23 17:50 �C Markdown ����鸴�ư�ť
- ���� `front/src/pages/Home.tsx` �� `markdownComponents.code` ����Ⱦ�߼���Ϊÿ���鼶�������������������Ͻ��������ư�ť��
- ���Ʋ�������ʹ�� `navigator.clipboard.writeText`���ڲ�֧�ֵĻ������˻ص���ʱ `textarea`����ͨ�� `toast` ��ʾ�ɹ�/ʧ����ʾ��
- ����ԭ���﷨�������������֣���΢���Ҳ��ڱ߾��Ա��ⰴť�ڵ����ݡ�

### 2025-10-23 17:35 �C ��ҳ�����֧�ֻس�����
- ����ҳ `MainContent` �ı������� `handleHomeKeyDown`�����û����� Enter ��δͬʱ��ס Shift ʱ��ֹĬ�ϻ��в��������з����߼���
- �������� Shift+Enter ������Ϊ���߼�����������ҳ����򣬲�Ӱ��������塣

### 2025-10-23 17:20 �C ������Ϣ������һ��
- Ϊ `ChatInterface` ���� `lastConversationIdRef`��ȷ��ͬһ�Ự�� React StrictMode �²����ظ�ִ�г�ʼ��Ϣ�߼���
- ���ν�������ʱ����������Ϣ���ͣ���ֹ����ظ����ص���˫������
### 2025-10-22 15:50 ? �Ự����־û����ļ��洢��
- ʵ�֣�Ϊ `ConversationMemoryManager` ���� `MemoryStore`��Ĭ��ע�� `FileMemoryStore`������ʷ��Ϣ��������ժҪд����̣�`server_data/memory`����
- �Ķ������� `server/server/src/memory/storage/fileMemoryStore.ts`���ع� `conversationMemory.ts` ���첽����/�־û������� `index.ts` ����� `MEMORY_STORE_DIR` ��ʼ���洢��
- ���ã�`server/.env.example` �� README ���� `MEMORY_STORE_DIR` ˵����Ĭ��Ŀ¼Ϊ `server_data/memory`��
- ��ע����δ�����Ự��̭��ѹ�����ԣ���������չ�� Redis/SQLite��

### 2025-10-22 14:20 ? ����˵ȱ�����������
- �������� `front/src/pages/Home.tsx` ������ `scale` ״̬�� `useEffect`������ `window.innerWidth` �� 1~1.35 ֮���ҳ���������ţ�������������������⡣
- ������Ϊ���������������㲢Ӧ�� `transform-origin: top center`��ȷ�����ź����ݾ�����ʾ��
- �������� `front/src/index.css` Ϊ `body` ����ǳ�ұ������������ź����ͻأ�ױߡ�
- ��ע���÷���Ϊ��ʱ�����������ƻ���Ϊ�ϵ㲼�֣������۵�����Ƭ��Ӧʽ����

### 2025-10-22 13:35 ? ��˻ָ������Ի���·
- �������� `server/.env` �� `server/server/.env` �в��� `PROVIDER=doubao`��ȷ��ÿ��������ָ�򶹰� Provider��
- ����������ռ�� 8302 �˿ڵľɽ��̣�����ִ�� `pnpm run build && pnpm start`��ȷ�� `node dist/index.js` ����������
- ��֤������ `POST http://localhost:8302/api/chat`�����ؽ�� `provider: doubao`������ָ�������
- ��ע����ǰ�Ự������Ϊ�ڴ�洢����������Ҫ���»�����ʷ��

### 2025-10-21 11:30 ? ��ҳ UI ����
- ������۵��Ĳ������ֲ�� ChatGPT/��Ѷ�ռ䣬�� Home ҳ��Ϊ��Ƭʽ���֣�����Ի�ѡ����Ƽ���Ƭ�ȡ�
- �Ż��Ի�����Ϣ�ܶȣ���ʷ�Ի�֧��չ��/�۵���Ԥ���Ƽ���ʾ��
- ��֤��`pnpm build:client`

### 2025-10-21 10:40 ? ǰ�˽��붹��ģ��
- �������ع� `aiService`��ʹ `sendAIRequest`/`optimizeContent` ֱ�ӵ��� `/api/chat` ���νӶ�����˷��ء�
- ǰ�ˣ��ع� Home ҳ�棬�������ɽ����塢����״̬����Դչʾ����ť��ͨ��ʵ�ӿڡ�
- ��֤���ֶ�����д������ǰ�˳ɹ�չʾ�����
