import Image from "next/image";
import Link from "next/link";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { Calculator, ClipboardCheck, CalendarClock, MessageSquare, Menu, ChevronRight, ArrowRight, CheckCircle, Smartphone } from "lucide-react";
import { ChatbotTriggerButton } from "@/components/ChatbotTriggerButton";

export default function Home() {
  return (
    <>
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        {/* TopNavBar */}
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#f0f2f5]">
          <div className="mx-auto flex h-full grow flex-col px-5 md:px-10 lg:px-40">
            <div className="flex items-center justify-between whitespace-nowrap py-4 max-w-[960px] w-full mx-auto">
              <div className="flex items-center gap-3 text-primary cursor-pointer">
                <div className="size-8">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                    <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em]">Haruplant</h2>
              </div>
              <div className="hidden md:flex flex-1 justify-end gap-8">
                <ChatbotTriggerButton className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-secondary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-orange-400 shadow-sm">
                  <span className="truncate">빠른 상담</span>
                </ChatbotTriggerButton>
              </div>
              <button className="md:hidden text-primary">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* HeroSection */}
        <section className="w-full bg-white">
          <div className="mx-auto flex flex-col px-5 md:px-10 lg:px-40 py-5 md:py-10">
            <div className="max-w-[960px] w-full mx-auto flex flex-col">
              <div className="@container">
                <div className="@[480px]:p-0">
                  <div
                    className="relative flex min-h-[560px] flex-col gap-6 overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat @[480px]:gap-8 items-center justify-center p-8 md:p-14 shadow-soft"
                    style={{ backgroundImage: 'linear-gradient(rgba(0, 74, 158, 0.4) 0%, rgba(0, 30, 60, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBjMi9wYhCUdTCMxSHovthtChX7hAYEMHPs0W-i5_v7HFNE64BLAJbgrh2-b12n7CTq-h-Q-4sUjZj_RuK6pSfjVoaIc3F44joVaJ70xR-KzgZQ4zRyjJIFgU8J9WyIlwu6n3TxzSMvtu-hvxofgHsCCVD8S3KWLoC8omBWMssJENOGwQS3nG0T0Gu7tHsCbHP4vo_pRig6cDWfnzUi2YBuZMkGX9hEIojthyAJiMqwQVjnz8YE_wnLtOZb5l8fbk7xP1geMHqVzw4")' }}
                  >
                    <div className="flex flex-col gap-4 text-center max-w-[800px] animate-fade-in-up">
                      <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em] @[480px]:text-4xl @[768px]:text-6xl drop-shadow-md break-keep">
                        강남역 임플란트,<br className="hidden md:block" /> 여기저기 검색하다 지치셨나요?
                      </h1>
                      <h2 className="text-gray-100 text-sm font-medium leading-relaxed @[480px]:text-base @[768px]:text-xl opacity-90 break-keep">
                        복잡한 과정 없이, 지금 바로 필요한 견적과 진단만 빠르게 확인하세요.
                      </h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full justify-center px-4 sm:px-0">
                      <ChatbotTriggerButton mode="quote" className="flex w-full sm:w-auto min-w-[160px] items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-secondary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-orange-400 hover:scale-105 transition-all shadow-lg ring-4 ring-orange-500/20 active:scale-95">
                        <span className="truncate">무료 견적 확인하기</span>
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </ChatbotTriggerButton>
                      <ChatbotTriggerButton className="flex w-full sm:w-auto min-w-[160px] items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 active:scale-95">
                        <span className="truncate">상담하기</span>
                      </ChatbotTriggerButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FeatureSection (Cards) */}
        <section className="w-full bg-background-light py-10">
          <div className="mx-auto flex flex-col px-5 md:px-10 lg:px-40">
            <div className="max-w-[960px] w-full mx-auto flex flex-col">
              <div className="flex flex-col gap-10 px-4 py-6 @container">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase">Smart Service</span>
                    <h2 className="text-[#101418] tracking-tight text-[28px] md:text-[32px] font-bold leading-tight">
                      하루플란트 스마트 서비스
                    </h2>
                    <p className="text-[#5e748d] text-base font-normal leading-normal max-w-[600px]">
                      환자분들의 편의를 위해 준비된 맞춤형 서비스를 경험해보세요.
                    </p>
                  </div>
                  <Link className="hidden md:flex items-center text-primary hover:text-blue-700 font-bold text-sm" href="#">
                    전체 서비스 보기 <ChevronRight className="ml-1 w-5 h-5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  {/* Card 1 */}
                  <ChatbotTriggerButton mode="quote" className="group flex flex-1 gap-5 rounded-xl border border-transparent bg-white p-8 flex-col shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Calculator className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10 w-full">
                      <h3 className="text-[#101418] text-xl font-bold leading-tight">간편 견적 확인</h3>
                      <p className="text-[#5e748d] text-sm font-normal leading-relaxed">방문 부담 없이 온라인으로 예상 비용을<br />미리 확인하실 수 있습니다.</p>
                    </div>
                    <div className="mt-auto pt-4 w-full">
                      <span className="text-primary text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                        바로가기 <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </ChatbotTriggerButton>
                  {/* Card 2 */}
                  <ChatbotTriggerButton mode="vision" className="group flex flex-1 gap-5 rounded-xl border border-transparent bg-white p-8 flex-col shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ClipboardCheck className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10 w-full">
                      <h3 className="text-[#101418] text-xl font-bold leading-tight">자가 진단 테스트</h3>
                      <p className="text-[#5e748d] text-sm font-normal leading-relaxed">몇 가지 간단한 질문으로 현재 치아 상태와<br />필요한 시술을 알아보세요.</p>
                    </div>
                    <div className="mt-auto pt-4 w-full">
                      <span className="text-primary text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                        테스트 시작 <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </ChatbotTriggerButton>
                  {/* Card 3 */}
                  <ChatbotTriggerButton mode="consultation_form" className="group flex flex-1 gap-5 rounded-xl border border-transparent bg-white p-8 flex-col shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <CalendarClock className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10 w-full">
                      <h3 className="text-[#101418] text-xl font-bold leading-tight">빠른 상담 예약</h3>
                      <p className="text-[#5e748d] text-sm font-normal leading-relaxed">원하시는 시간에 대기 없이 전문가와<br />1:1 상담을 예약하세요.</p>
                    </div>
                    <div className="mt-auto pt-4 w-full">
                      <span className="text-primary text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                        예약하기 <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </ChatbotTriggerButton>
                </div>
                <div className="flex md:hidden justify-center mt-4">
                  <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal">
                    <span className="truncate">전체 서비스 보기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info/Promo Section */}
        <section className="w-full bg-white py-12 border-t border-gray-100">
          <div className="mx-auto flex flex-col px-5 md:px-10 lg:px-40">
            <div className="max-w-[960px] w-full mx-auto flex flex-col">
              <div className="flex flex-col md:flex-row gap-8 items-center rounded-2xl bg-gradient-to-r from-[#f0f7ff] to-[#fff] p-8 md:p-12 border border-blue-50">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>검증된 의료진</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#101418] leading-tight">
                    과잉진료 없는 정직한 진료,<br />하루플란트가 약속합니다.
                  </h2>
                  <p className="text-[#5e748d] text-base">
                    10,000건 이상의 임상 경험을 가진 전문 의료진이 처음부터 끝까지 책임지고 진료합니다. 불필요한 시술은 권하지 않습니다.
                  </p>
                  <ul className="flex flex-col gap-2 mt-4 text-[#101418]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>보건복지부 인증 전문의 진료</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>정품 임플란트 보증서 발급</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>철저한 사후 관리 시스템</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1 w-full md:w-auto flex justify-center">
                  <ChatbotTriggerButton className="relative w-full h-[300px] md:h-[340px] rounded-2xl overflow-hidden shadow-lg group block text-left p-0">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="Doctor consulting with a patient looking at x-rays" style={{ backgroundImage: 'url("/1.png")' }}>
                    </div>
                  </ChatbotTriggerButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-background-light border-t border-[#f0f2f5] mb-20 md:mb-0">
          <div className="mx-auto flex flex-col px-5 md:px-10 lg:px-40 py-10">
            <div className="max-w-[960px] w-full mx-auto flex flex-col">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="size-6">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                        </svg>
                      </div>
                      <span className="text-xl font-bold">Haruplant</span>
                    </div>
                    <div className="text-[#5e748d] text-sm leading-relaxed">
                      서울특별시 서초구 강남대로 411 ds타워 6-10F 하루플란트치과<br />
                      대표전화: 02-534-2875 | 팩스: 02-534-2870<br />
                      사업자등록번호: 639-17-02181 | 대표자: 변성만, 강민지
                    </div>
                  </div>
                  <div className="flex gap-12 flex-wrap">
                    <div className="flex flex-col gap-3">
                      <h4 className="font-bold text-[#101418]">바로가기</h4>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/info/about">병원 소개</Link>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/info/team">의료진</Link>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/info/information">오시는 길</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h4 className="font-bold text-[#101418]">치료이야기</h4>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/implant_case">임플란트 케이스</Link>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/review">치료후기</Link>
                      <Link className="text-[#5e748d] hover:text-primary text-sm" href="https://haruplant.co.kr/before_after/implant">전후사진</Link>
                    </div>
                  </div>
                </div>
                <div className="h-px w-full bg-[#f0f2f5]"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                  <p className="text-[#9aaebd] text-sm font-normal">© 2024 Haruplant Dental Clinic. All rights reserved.</p>
                  <div className="flex gap-6">
                    <Link className="text-[#5e748d] hover:text-primary text-sm font-normal" href="#">이용약관</Link>
                    <Link className="text-[#5e748d] hover:text-primary text-sm font-normal" href="#">개인정보처리방침</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <StickyBottomBar />
      </div>
    </>
  );
}
