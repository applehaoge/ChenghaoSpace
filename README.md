# �Ⱥƿռ䣨ChenghaoSpace��

> AI �Ի���ೡ���������֡���ǰ�ֿ��Ѳ��Ϊ `front/`��React + Vite ǰ�ˣ��� `server/`��Fastify ��ˣ���������Ŀ��Ĭ��ͨ������ģ���ṩ��ʵ�Ի�������

---

## ��Ŀ�ṹ

```text
.
������ front/                # React + Vite ǰ��
��   ������ src/              # ҳ�桢�����hooks��API
��   ������ README.md         # ǰ�˵���ʹ��˵��
��   ������ .env.local        # ǰ�˱��ػ����������ѱ� .gitignore ���ԣ�
������ server/               # Fastify ��ˣ���ǰͨ�� dist/ ֱ�����У�
��   ������ dist/             # �ѱ��� JS����ֱ�� `node dist/index.js`
��   ������ server/src/       # TypeScript Դ�루�����Ա����ά����
��   ������ .env.example      # ��˻�������ʾ��
��   ������ package.json      # �����������
������ PROCESS.md            # Ǩ����ԽӲ�����¼
������ git-auto-push.bat     # Windows һ���ύ�ű������� git init / ��Զ�ˣ�
������ .gitignore            # ȫ�ֺ��Թ����ų� node_modules��.env����������ȣ�
```

---

## ����׼��

### 1. ��װ����
```bash
# �ֿ��Ŀ¼
pnpm install              # ͬ����װ front/ �� server/ ������
```

### 2. ���û�������
- ��ˣ����� `server/.env.example` Ϊ `server/.env`����������Ҫ��д��
  ```ini
  PROVIDER=doubao
  DOUBAO_API_KEY=��Ķ�����Կ
  # ��ѡ���Զ���˿� & ����
  PORT=8302
  HTTP_PROXY=http://127.0.0.1:33210
  HTTPS_PROXY=http://127.0.0.1:33210
  ALL_PROXY=socks5://127.0.0.1:33211
  ```
- ǰ�ˣ��� `front/.env.local` ��ָ����˵�ַ��Ĭ�� 8302����
  ```ini
  VITE_API_BASE=http://localhost:8302
  ```

---

## ������ʽ

### ���
```bash
pnpm --filter ./server install       # ȷ�������Ѱ�װ
pnpm --filter ./server dev           # ���벢���� dist/index.js
# ���ߣ�
node server/dist/index.js
```
�����ɹ����ն˻���� `Server running at http://localhost:8302`��

### ǰ��
```bash
cd front
pnpm install                         # �״ΰ�װ����
pnpm dev                             # Ĭ�϶˿� 3000������ռ�û�˳��
```
��������� Vite ����ĵ�ַ���������°�������棨����ʽ Markdown ��Ⱦ����

---

## ���������ٲ�

| ���� | �Ų齨�� |
| ---- | -------- |
| ���췵�ء�ʾ���𰸡� | ˵����ʵ LLM ����ʧ�ܣ���鿴 `server` �ն���־������Ϊ������Կ������������⣩ |
| ǰ������ 404/500 | ��� `front/.env.local` �е� `VITE_API_BASE` �Ƿ�ָ����ʵ�ʵ�ַ |
| Git ���ʹ��� `.env` | ��Ŀ¼ `.gitignore` �Ѻ��� `.env*`������ `git add --force` |
| `pnpm build` �� Windows ���� | �ɽű�ʹ�� `rm`���ɸĳ� `rimraf` ������ Unix ����ִ�� |

---

## Git ������ʾ

- �ֿ����� `D:\AI_agent_project1` ��ʼ���������� `https://github.com/applehaoge/ChenghaoSpace`��
- `server/.env` �������ļ��ѱ� `.gitignore` �ų��������ύ���ֿ⡣
- ��ʹ�ø�Ŀ¼�� `git-auto-push.bat` һ���ύ���ű�����ʾ�����ύ��Ϣ����
- ��Ŀ¼ `chenghaoSpace/` ����Ϊ���ݱ�����δ���� git �ύ��

---

## �����滮����

- ����ά�� TypeScript Դ�룬�ɽ� `server/server/src` ����Ϊ `server/src` ���޸������ű���
- ��չ��ʵҵ����ʱ�����ں����������/�Ƽ��� API������ǰ�� `aiService` ��ͳһ���á�
- �����������ӻỰ�浵�����ػ������ǿ������

��ӭ�������� `PROCESS.md`�������ĵ����ύ Issue / PR��??
