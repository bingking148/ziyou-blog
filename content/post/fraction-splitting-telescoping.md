---
title: '裂项相消法：从分数拆分看透数列求和的本质'
date: 2026-05-31T10:48:33+08:00
lastmod: 2026-11-25T21:30:00+08:00
cover: /images/covers/fraction-splitting-cover.jpg
categories: ['数学笔记']
tags: ['数学', '数列', '裂项相消']
description: '把 1/(n(n+1)) 拆成两个分数之差，让中间项成对抵消——从最简单的通分出发，一步步看透裂项相消求和的本质。'
math: true
mermaid: false
comments: true
toc: true
---

## 一、从最简单的分数拆分开始

先看几个很普通的式子：

$$\frac{1}{1\times2}=1-\frac12$$

$$\frac{1}{2\times3}=\frac12-\frac13$$

$$\frac{1}{5\times6}=\frac15-\frac16$$

这些式子并不高级，本质就是通分。

比如：

$$\frac15-\frac16=\frac{6-5}{5\times6}=\frac1{5\times6}$$

于是可以得到一般规律：

$$\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$$

这就是数列求和里非常重要的思想：**裂项相消**。

## 二、为什么裂项相消这么有用？

如果要求：

$$\frac{1}{1\times2}+\frac{1}{2\times3}+\frac{1}{3\times4}+\cdots+\frac{1}{n(n+1)}$$

把每一项都拆开：

$$\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\left(\frac13-\frac14\right)+\cdots+\left(\frac1n-\frac1{n+1}\right)$$

中间的部分会一正一负全部抵消，最后只剩：

$$1-\frac1{n+1}$$

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-fraction-cancel" viewBox="-14 -14 688 208" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg" overflow="visible" data-rough="1">
  <title>&#21152;&#21040;&#31532;&#19977;&#39033;&#26102;&#65292;&#20013;&#38388;&#30340; 1/2 &#21644; 1/3 &#25269;&#25481;</title>
  <desc>1  &#8722;  1/2&#65307;1/2  &#8722;  1/3&#65307;1/3  &#8722;  1/4&#65307;&#21097;&#19979;  1  &#8722;  1/4&#65307;&#20013;&#38388;&#22235;&#39033;&#25269;&#25481;&#20102;</desc>
  <style>.diag-fraction-cancel{--sk-ink:#1e1e1e;--sk-yellow:#fff3bf;--sk-green:#b2f2bb}[data-theme="dark"] .diag-fraction-cancel{--sk-ink:#f1f3f5;--sk-yellow:#5c4a1a;--sk-green:#1a4d2e}</style>
  <defs><path id="diag-fraction-cancel-v-31" d="M103-78Q103-116 109-254.5Q115-393 118-433Q118-458 116-467Q110-460 86.5-452Q63-444 51-444Q31-444 15-454Q-1-464 1-471Q85-593 121-631Q154-665 180-665Q190-665 202-662Q209-660 209-650L209-392Q209-380 208-364L203-255Q202-240 202-227Q202-133 198-29Q203-3 179 23Q162 28 150 28Q131 28 116 16Q115 16 112.5 13.5Q110 11 110 10Q97-7 97-37Q97-39 103-78"/><path id="diag-fraction-cancel-x-2212" d="M383-359L101-356Q71-356 47-370Q37-382 37-399L37-405L47-425Q69-436 95-436L113-435L384-438Q408-438 429-427Q438-415 438-398Q438-393 429-372Q408-359 383-359"/><path id="diag-fraction-cancel-v-2f" d="M-12 23Q13-13 89.5-131Q166-249 212-306Q240-360 314.5-487.5Q389-615 420-681Q444-738 454-752L459-782Q465-804 467-806Q489-831 514-834Q547-837 569-801Q578-771 568.5-729.5Q559-688 542-679Q528-686 514-667Q500-648 477-607.5Q454-567 433-542Q342-373 266.5-251Q191-129 89 0Q80 10 69.5 26Q59 42 50.5 52.5Q42 63 30 69Q26 73 18 75Q14 76 10 75Q6 74 2 70Q-2 66-4.5 64Q-7 62-12 55.5Q-17 49-18 48Q-19 37-12 23"/><path id="diag-fraction-cancel-v-32" d="M92-146Q122-184 145-199Q168-214 208-222Q215-222 268-225.5Q321-229 333-224Q363-224 363-227Q387-254 417.5-316Q448-378 459-445Q462-467 456-484Q450-501 433.5-513Q417-525 404-531.5Q391-538 367-547Q343-547 331-546Q319-545 300-541.5Q281-538 269.5-531Q258-524 245-511Q232-498 223-479Q216-450 214-446Q213-444 212-440.5Q211-437 210.5-436Q210-435 208.5-432Q207-429 206.5-429Q206-429 204-427Q202-425 200.5-425.5Q199-426 196-424.5Q193-423 190.5-424Q188-425 183-424Q163-419 141-433Q119-447 116-469Q97-517 136-551Q171-586 194.5-600Q218-614 272-633Q326-640 358-640Q415-640 446-623Q495-597 512-580Q568-525 554-418Q546-356 528-314Q510-272 468-205Q482-202 493.5-198.5Q505-195 517-189.5Q529-184 536-181Q543-178 555.5-169.5Q568-161 573-158Q578-155 592.5-144Q607-133 612-130Q614-129 624-121Q634-113 637-110.5Q640-108 649-100.5Q658-93 661.5-88.5Q665-84 670.5-76.5Q676-69 678-62.5Q680-56 681.5-47.5Q683-39 682-31Q689-11 663 10Q649 12 631 10Q607-19 568-51Q487-112 403-105Q397-89 390-79.5Q383-70 368.5-56.5Q354-43 344-32Q333-17 311-6.5Q289 4 272 2Q242 5 221 5Q182 5 139-15Q119-28 111.5-36Q104-44 88-56Q67-93 92-146M188-106L207-88L238-86Q276-94 288-117Q290-121 291.5-122Q293-123 294-122.5Q295-122 296-120L296-123L313-136Q300-143 278-143Q253-143 227.5-133Q202-123 188-106"/><path id="diag-fraction-cancel-v-33" d="M48-38Q48-41 48.5-52.5Q49-64 49.5-67.5Q50-71 51.5-79Q53-87 55.5-90.5Q58-94 62.5-98.5Q67-103 74-106Q99-103 145-85.5Q191-68 207-64Q289-43 363-43Q427-43 480-57Q483-59 496.5-67Q510-75 516.5-79.5Q523-84 533.5-92Q544-100 550-107.5Q556-115 560-124Q564-152 547.5-181Q531-210 518-222Q505-234 475-259Q447-278 408.5-291Q370-304 340.5-310Q311-316 265-323Q219-330 196-335Q189-337 178.5-340Q168-343 164.5-344.5Q161-346 156-351.5Q151-357 146-368Q133-386 134.5-414Q136-442 152-455Q164-459 204.5-470.5Q245-482 277.5-493Q310-504 326-513Q334-510 337-518Q340-526 339-536Q324-538 284.5-548.5Q245-559 225-559Q202-562 177-562Q103-562 46-531L26-546Q1-591 31-611Q45-630 80-645Q87-646 118.5-651Q150-656 170.5-658Q191-660 207-658Q376-640 472-578Q472-574 475.5-562Q479-550 478.5-541.5Q478-533 473-526Q469-497 450-477.5Q431-458 401.5-440.5Q372-423 361-412Q360-407 369-400Q441-393 550-298Q551-297 563-283.5Q575-270 577-267Q579-264 589.5-251.5Q600-239 603-234Q606-229 613.5-217Q621-205 624-197Q627-189 631.5-177.5Q636-166 638-155Q640-144 641-132Q646-63 562 6Q504 35 395 43Q384 42 352 40.5Q320 39 304.5 38Q289 37 260 34.5Q231 32 211.5 29Q192 26 168 21.5Q144 17 123 11Q60 13 48-38"/><path id="diag-fraction-cancel-v-34" d="M384-239L371-246L144-246Q65-267 36-296Q29-302 23.5-310.5Q18-319 15.5-324.5Q13-330 12-343Q11-356 11-360Q11-364 11.5-379.5Q12-395 12-397Q25-442 93-530L163-600Q190-628 232-625Q260-608 251-581Q236-561 194.5-515.5Q153-470 137-448Q136-442 128-431Q120-420 114.5-411Q109-402 107-391Q105-380 115-375Q122-367 156-347Q212-339 254-339Q301-339 365-347Q372-347 390-350Q408-353 409-353Q411-354 416-359Q421-364 422-366Q424-371 441-420Q458-469 465-490Q472-511 481-546.5Q490-582 492-606Q494-624 510.5-639Q527-654 545-651Q567-655 581-636.5Q595-618 593-596Q595-590 593.5-583Q592-576 586.5-567Q581-558 580-555Q561-520 540-451.5Q519-383 510-362Q537-330 548-290Q548-275 535-251Q522-227 510-227Q508-226 500-224.5Q492-223 483-221.5Q474-220 473-220Q459-181 459-131Q458-116 460-103.5Q462-91 466.5-76.5Q471-62 473-50Q473-29 454-12Q435 0 435 0Q431 1 419-1Q407-3 403-5L384-24Q379-30 376-36.5Q373-43 372-51.5Q371-60 370.5-64.5Q370-69 370.5-80Q371-91 371-94L371-138Q371-142 384-239"/><path id="diag-fraction-cancel-x-5269" d="M362 104L358 104L339 94Q329 82 327 66L327-169Q302-144 283.5-116Q265-88 162 12Q141 37 107 37L88 27Q78 16 78-8Q219-159 253.5-204Q288-249 327-290L321-538L104-532Q66-537 66-573L66-579L76-599L96-608L325-615L323-682Q284-676 249.5-668Q215-660 180-656L160-666Q150-680 150-703L160-723Q340-773 536-777L556-768Q565-756 565-732L556-713Q522-699 484-699Q446-699 401-695L401-617L597-619L622-606Q632-595 632-571L622-552Q608-542 593-540L397-540L403-288Q526-165 561.5-135Q597-105 651-59Q661-47 661-23L651-4Q638 6 614 6Q571-27 529-62.5Q487-98 403-183L403 74L394 94Q381 104 362 104M915 79Q905 79 891 74Q813 23 787 4Q777-8 777-31L787-51Q799-61 822-61L861-37L869-729Q874-766 916-766L936-756L945-736Q936-139 936-24Q936 2 937 27Q937 45 935 62Q933 79 915 79M240-247L225-247Q211-253 205-267L203-286Q168-280 139.5-272.5Q111-265 82-261Q68-267 63-280L63-296Q68-310 84-317Q111-325 140.5-330Q170-335 197-343L197-397Q164-398 132-398Q100-398 74-411Q68-419 68-431Q68-447 88-456L197-454L196-465Q196-487 209-505Q217-511 228-511Q245-511 254-491L261-267Q254-253 240-247M613-246L536-249Q491-249 465.5-279.5Q440-310 437-348Q434-378 434-411Q434-419 434.5-443.5Q435-468 452-503Q460-509 472-509Q491-509 499-487L493-446L601-450Q614-444 620-431L620-413Q614-399 601-394L489-388Q488-381 488-372Q488-315 516-309Q530-305 556-305L579-306Q577-314 577-321Q577-362 608-362Q625-362 634-343L638-272Q635-250 613-246M728-282L722-282L702-292Q692-304 690-319L692-732Q697-770 739-770L760-760L770-740L770-323Q765-282 728-282"/><path id="diag-fraction-cancel-x-4e0b" d="M477 61L474 61L454 51Q441 28 441-1L442-18L438-658L141-652Q104-657 104-693Q104-698 113-719L133-729L814-740Q837-740 854-729Q863-717 863-693L854-674Q836-661 814-661Q803-662 515-662L519-460Q737-396 809-360Q818-349 818-325L809-306Q795-296 771-296Q710-323 521-376Q521-12 522-1Q522 28 509 51Q496 61 477 61"/><path id="diag-fraction-cancel-x-4e2d" d="M521 78L515 78L495 68Q485 57 483 41L479-235L195-233Q159-234 153-251.5Q147-269 131-580Q131-604 148-609Q160-613 275-613L474-611L472-748L481-768Q495-777 519-777L538-768Q548-754 550-738L550-608L725-609Q840-609 857.5-605Q875-601 879-567L863-261Q857-229 824-229L556-235L560 49L550 68Q538 78 521 78M556-312L791-310L803-528L550-532L556-312M207-536L225-310L479-312L474-534"/><path id="diag-fraction-cancel-x-95f4" d="M653-155L638-156L381-158Q347-164 347-196L340-487Q340-511 356-518Q368-523 497-523L656-522Q690-519 690-485L689-472L691-184Q691-155 653-155M420-230L614-230L614-316L420-314L420-230M417-450L418-388L616-390L616-448L417-450M279-615Q241-619 236-659L197-745Q184-760 184-774Q184-789 196-802Q208-815 222-815Q230-815 238-812Q268-785 288.5-739Q309-693 316-650Q311-620 279-615M892 50Q858 50 812 28Q781 14 770 1Q753-9 752-29Q760-66 787-66Q798-66 813-60L852-39L850-667L461-675Q453-674 444-674Q410-674 382-691Q371-704 371-716Q371-729 384-742L396-754L483-752Q875-746 907-741Q926-738 928-702L924 8Q920 50 892 50M164 55Q146 55 125 33Q118-359 118-500Q118-570 122-586Q127-612 155-612Q168-612 180-601Q193-575 193-546Q193-528 188-508L199 30Q183 55 164 55"/><path id="diag-fraction-cancel-x-56db" d="M865-50L854-51L148-53Q119-58 114-98Q109-138 98-606Q100-642 129-645L863-643Q916-639 916-596Q902-94 896-70Q890-50 865-50M184-263L189-130L826-132Q826-149 832-269Q590-276 553-391Q539-429 539-501Q539-534 542-569L448-571Q446-505 412-450.5Q378-396 326-349Q274-302 245.5-284.5Q217-267 184-263M174-567L180-343L199-347Q286-409 310.5-439.5Q335-470 352.5-501Q370-532 372-569L174-567M836-345L836-565L620-565Q616-536 616-505Q616-485 619-446.5Q622-408 655-384Q688-360 736.5-352.5Q785-345 836-345"/><path id="diag-fraction-cancel-x-9879" d="M95-188Q57-193 57-229Q58-235 67-255Q99-267 218-274L218-593L116-587L97-597Q86-611 86-629Q87-635 97-654Q126-668 161-668Q196-668 391-672L410-662Q420-650 420-627L410-607Q396-597 381-595L295-595L297-286Q320-292 348.5-293Q377-294 404-296L424-286Q434-274 434-251L422-229Q342-218 259.5-206Q177-194 95-188M484 74L465 64Q455 53 455 29L465 10Q490-2 530-26Q639-90 660-269Q672-372 686-474Q697-484 715-484Q721-483 740-474Q751-460 751-443Q751-431 741-304Q736-239 721-179Q774-134 935-6Q948 8 948 33L938 53Q927 63 909 63L903 62L691-100Q678-64 654.5-34Q631-4 582 33Q533 70 484 74M553-143L547-144L527-153Q510-187 508-226L498-552Q498-588 516.5-589.5Q535-591 621-595L666-688L529-682Q514-684 502-693Q492-705 492-729L502-748Q527-760 557-761Q771-761 849-759Q888-758 921-746Q931-734 931-711L921-691Q904-679 881-679L756-688L705-593L825-594Q882-594 895-592Q914-590 914-566Q913-558 911-210L901-190Q890-180 872-180Q866-181 847-190Q835-212 834-237Q834-313 837-515L580-519L592-173L582-153Q570-143 553-143"/><path id="diag-fraction-cancel-x-62b5" d="M298 78Q291 78 282 74Q267 72 189 2Q180-10 180-26Q180-31 189-51Q201-61 224-61L247-50L237-286Q201-276 170.5-263Q140-250 107-244L89-254Q79-267 79-290L89-309Q138-337 233-364L229-567L117-563Q81-568 81-610L91-629Q121-641 156-642Q191-643 228-643L226-745Q231-781 274-781L293-771Q303-761 303-743L303-646L354-648L373-639Q383-625 383-603L373-583Q347-571 305-571L309-387Q337-396 362-398L381-389Q391-375 391-353L381-334Q347-318 311-309Q317-218 324 44Q319 78 298 78M486 71Q468 71 459.5 46Q451 21 448-22.5Q445-66 442-522Q442-653 443-666Q444-684 460.5-689.5Q477-695 597.5-715Q718-735 811-749L830-739Q839-729 839-705L830-687Q794-671 752.5-667Q711-663 673-654Q680-538 705-421L786-419L805-420Q840-420 870-408Q879-395 879-378Q879-373 870-353Q841-341 808-341Q795-341 782-343L724-345Q774-192 849-64L866-86Q877-95 894-95Q899-95 919-86Q929-72 929-50Q919-24 914 0Q900 60 875 60Q860 60 837 44Q714-112 647-345L517-349L522-40Q553-64 587-66L605-57Q615-46 615-22L605-4Q504 71 486 71M517-423L629-419L621-475Q602-583 599-641L515-623L517-423M724 26L705 35Q688 34 673 24Q627-50 612-95Q612-113 628-128L648-138Q667-136 682-120Q727-37 740-7Q740 11 724 26"/><path id="diag-fraction-cancel-x-6389" d="M262 78Q254 78 243 74Q158 20 133-4Q121-18 121-41L131-61Q143-70 160-70Q176-70 203-45L203-274Q115-243 84-241L64-251Q55-263 55-280Q55-285 64-306Q98-321 205-356L205-573L96-571Q59-576 59-612Q59-618 68-639Q97-649 137-649Q177-649 207-654Q210-681 210-710Q210-762 221-789Q234-799 259-799L278-789Q290-761 290-727Q290-714 288-701L286-654L351-656L370-646Q380-635 380-611L370-591Q335-577 282-577L282-378Q306-388 329-388L349-378Q358-364 358-347Q358-342 349-321Q317-304 280-298Q282 43 283 52Q283 78 262 78M659 78L653 78L634 68L622 45L618-88L396-90Q358-95 358-138L368-157Q389-169 415-169L618-165L618-231L472-235Q439-235 438-262L415-530Q415-565 427.5-567Q440-569 571-569Q571-725 570-740Q570-772 585-797Q599-807 622-807L642-797Q651-783 651-766L647-715L820-713Q869-713 869-672L869-666L859-646Q843-635 821-635L647-639L649-571L840-575Q873-574 873-559Q873-229 823-229L698-231L694-165L862-165Q890-165 912-153Q922-142 922-118L912-98Q892-85 866-85Q852-86 694-88L698 49L688 68Q677 78 659 78M505-315L779-315L781-366L499-366L505-315M497-442L785-442L789-499L495-493"/><path id="diag-fraction-cancel-x-4e86" d="M507 70Q500 70 491 66Q466 59 443.5 41Q421 23 399 6Q374-14 374-47L384-66Q395-76 413-76Q430-76 476-33Q498-109 498-191Q498-206 496.5-244Q495-282 490-339Q485-396 425-474Q421-485 421-494Q421-509 433-519L577-664Q385-660 265-645L244-654Q232-668 232-691L242-711Q360-740 645-740Q697-740 716-736Q731-733 731-721Q731-710 716-689L517-489Q565-396 569-315Q571-268 571-224Q571-191 569-137.5Q567-84 556.5-37Q546 10 534 45Q525 70 507 70"/></defs>
  <path fill="var(--sk-yellow)" stroke="none" d="M30.2 21.5C125.6 21.8 219.1 18.1 283.5 20.8C293.3 21.3 297.4 24.3 295.5 29.7C296.9 34.1 296.1 41 294.9 46.4C294.2 52.4 289.4 57.7 280.4 57.8C192.7 57.3 97.6 62 27.6 61.1C21.6 58.6 14.7 58.9 18.5 48.3C15 41.7 18.2 38.7 15.1 32.8C17.4 21.4 22.1 20.2 27.8 17C28 20 28 20 28 20"/><path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M27.6 19.5C108.5 17.6 187.6 19 283.1 20.5M28.8 20C82.6 19.2 139.4 19.8 283.4 19.9M284 20C291 19.8 295.4 23.7 294.5 31.9M284.3 20.5C290.9 17.8 295.9 24.3 294.7 33.6M296 30.7C294.4 39 295 45.6 296.6 46.8M296.1 32C296.2 36.9 296.2 41.8 296 48.4M296 48C295.8 54.5 291.5 61.3 282.2 60M295.8 49.4C294 55.8 291.4 61.7 283.1 60.5M283.2 61.3C186.6 59.3 91.5 58.1 28.3 61.1M284.2 59.5C184.7 60.8 85.5 60.8 27.6 60.8M28 60C18.7 60.2 15.2 55.8 15.3 49.4M29.7 60.8C22.2 61.7 14.9 53.8 14 47M16 49.1C15.7 44.9 14.8 38.4 16.4 31.2M15.6 47.3C16.8 42.2 15.4 38.3 16 31.3M16 32C16.2 25 21.5 20.7 28.2 18.2M15.8 33C14.6 26.1 19.7 20 29 20.2M28 20C28 20 28 20 28 20M28 20C28 20 28 20 28 20"/>
  <g fill="var(--sk-ink)"><use href="#diag-fraction-cancel-v-31" transform="translate(122 45.9) scale(0.0160)"/><use href="#diag-fraction-cancel-x-2212" transform="translate(142.3 45.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-31" transform="translate(166.3 45.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(170.6 45.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-32" transform="translate(178.6 45.9) scale(0.0160)"/></g>
  <path fill="var(--sk-yellow)" stroke="none" d="M25.7 67.1C115.3 68.6 198.6 68 281.7 68.6C291.7 68.1 294.7 75.5 293 76.4C295.8 86 295.2 88.1 296.5 98C296.2 106.9 295.2 107.8 285.1 109.9C190.6 107.9 93.3 112.3 29 108.6C18.1 109.7 15.2 105.8 16.7 99.4C13.3 86.8 18.6 82.6 13.3 81.7C16.5 74.6 18.7 67.5 24.7 65.6C28 68 28 68 28 68"/><path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M27.5 69.3C82.5 67.1 137.5 67.9 282.8 67.2M28.7 67.6C101.5 68 175.9 68.3 283.9 68.7M284 68C293.5 67.1 296.6 71.6 295.2 80.6M282.3 69.8C291.9 70.3 295.3 74 297.8 82.1M294.7 80.7C297.5 83.9 295.5 88.6 296.9 96.7M296.5 80.7C296.5 86.4 295.2 91.3 295.5 96.8M296 96C296.3 104.6 292.5 109.1 284.5 106.4M297.8 95C293.9 103.9 289.8 108.5 285.7 106.5M284.1 108C209.7 109.1 136.2 108 27.5 108.7M283.8 107.7C209.6 107.5 134.3 107.6 28 108.5M28 108C22 109.1 16.2 104.4 15.3 97.7M28.1 108C18.2 106.9 15 103.9 14.7 94.3M16.9 97.1C15.7 90.9 15.6 84.2 15.8 80.9M15.9 96.3C15.5 90.9 15.9 85.3 15.4 79.3M16 80C15 70.2 19.1 66.4 29.7 68.6M15 81C15.7 70.4 20.1 66.4 25.9 69M28 68C28 68 28 68 28 68M28 68C28 68 28 68 28 68"/>
  <g fill="var(--sk-ink)"><use href="#diag-fraction-cancel-v-31" transform="translate(112.5 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(116.9 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-32" transform="translate(124.9 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-x-2212" transform="translate(152.2 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-31" transform="translate(176.2 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(180.6 93.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-33" transform="translate(188.6 93.9) scale(0.0160)"/></g>
  <path fill="var(--sk-yellow)" stroke="none" d="M25.5 113.7C98.9 115.6 173.6 114.9 284.3 113.2C295.1 114.1 296.3 119.8 295.7 126.9C297.2 131.4 294.7 137 295.4 142C296 153.5 295.5 153.3 286 153.9C215 153.5 150.8 154.2 26.7 156.5C22.2 158 15.7 154.7 19.5 140.7C15.2 139.2 14.8 129.9 13.9 126.8C17.5 116.6 23.5 114.3 27.5 116.9C28 116 28 116 28 116"/><path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M26.6 117.5C83.5 117.2 140 117.2 284.7 116.8M28.6 116.7C88.3 116.5 148.5 117.1 283.2 115.9M284 116C291.9 115.3 295.4 118 295.6 126.9M282.3 115.9C294.2 115.6 297.2 121.2 296.2 128.5M295.9 128.2C296.2 132.6 296.7 139.2 294.9 142.4M296.4 127.6C295.4 132.3 295.9 137.4 295.6 144.4M296 144C297.1 150 290.2 155.6 282.8 155M294.7 142.3C295.8 150.4 293.4 155.9 282.4 157.8M284.7 155.6C200.2 154.6 114.3 153.5 29.3 155.1M284.3 155.6C196.6 158.4 107.5 157.1 28.2 155.9M28 156C19.2 154.6 15.4 153.1 15.2 144.6M27.2 154.2C21.8 156.7 17 152.5 13.8 141.8M14.9 144.3C14.6 141.9 14.7 136 15.7 128.4M15.2 143.4C15.5 139.4 16.6 136.5 15.4 128.8M16 128C14.5 120.9 19.3 115.7 26.3 117M17.9 128.2C17.5 121 20.1 117.1 27.9 116.8M28 116C28 116 28 116 28 116M28 116C28 116 28 116 28 116"/>
  <g fill="var(--sk-ink)"><use href="#diag-fraction-cancel-v-31" transform="translate(113.1 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(117.4 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-33" transform="translate(125.4 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-x-2212" transform="translate(152.3 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-31" transform="translate(176.3 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(180.7 141.9) scale(0.0160)"/><use href="#diag-fraction-cancel-v-34" transform="translate(188.7 141.9) scale(0.0160)"/></g>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M150.2 40.4C171.9 38.4 193.5 41.2 218 38.7M150.6 40C168 39.6 185 41.5 220.9 39.1"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M38.6 89.5C53.9 89.5 68.2 87.1 111.8 88.3M41 87.9C60.2 87.8 79.4 87.4 109.8 88"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M148.4 87.7C176.6 88.8 202 85.6 231.3 86.6M150.8 87.4C179.1 87.6 207.6 88.8 230.4 89"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M41.3 136C63.8 135.6 90.9 135.3 119.7 136.7M40.7 136.7C63.8 135.6 89.8 137.2 119.6 136"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M318.6 88.7C343.8 89.2 365.3 92.4 388.9 89.2M319 89.2C343 89.5 365.3 90.2 390.9 90.7"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M391 89.4C385.3 92.7 382.1 93.3 379.1 96.5M390.6 90.3C386.3 91.1 383.8 93.4 378.3 95.5"/>
  <path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M390.5 89.9C386.7 88.4 381.5 84.9 377.3 85M389.8 89.8C387.9 89.3 385.3 88.3 378.1 84.8"/>
  <path fill="var(--sk-green)" stroke="none" d="M417.9 47.5C472.1 46.2 528.9 48.4 618.9 52.9C628.9 52.6 632.9 52.6 632.2 65.6C635.2 79.1 633.9 93.2 635.2 120.2C633 128.4 632.1 131.6 619.8 126.4C573.2 130.1 525.8 127.9 412.8 127.8C410.9 127.1 407.4 122.7 405.9 119C402.3 104.1 404.1 90.3 401.1 61.2C403.7 50.6 404.6 53.3 419.2 48.6C416 50 416 50 416 50"/><path fill="none" stroke="var(--sk-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M417.7 49.5C495.9 50.9 576.2 50 622.1 49M415.8 50.3C470 52.5 524.4 52.4 622.5 49.6M622 50C628 49 632.6 54.9 632.2 60.5M623.9 49.5C630.2 49.4 634.7 55 633.8 61M632.4 61.5C632.7 74.6 635.1 87.7 635.5 118.8M633.7 61.2C634.4 79.1 633.7 97.4 633.2 117.5M634 118C634 125.4 629.6 129.1 622.6 129.9M632.1 117.3C632.7 124.3 630.5 129.8 622.3 131.8M621.4 130.4C564.9 131.6 506.3 131.5 415.6 130.1M621.8 129.7C549.3 129.9 476.8 129.6 416.2 129.4M416 130C407.5 131.4 403.9 126 402.3 119.8M415.3 129.3C409.3 131.8 404.8 127.1 403 120.2M403.6 117C404.3 98.4 406 78 402.7 61.9M403.2 118.6C404 105.2 404.2 90.9 404.2 62.9M404 62C404.2 55.4 406.8 50.8 415.6 50.2M404.1 63.2C404.6 53.1 406.2 49.4 414.3 48.2M416 50C416 50 416 50 416 50M416 50C416 50 416 50 416 50"/>
  <g fill="var(--sk-ink)"><use href="#diag-fraction-cancel-x-5269" transform="translate(454.4 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-x-4e0b" transform="translate(472.4 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-v-31" transform="translate(508.4 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-x-2212" transform="translate(531.2 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-v-31" transform="translate(558.2 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-v-2f" transform="translate(563.1 84.6) scale(0.0180)"/><use href="#diag-fraction-cancel-v-34" transform="translate(572.1 84.6) scale(0.0180)"/></g>
  <g fill="var(--sk-ink)" opacity="0.7"><use href="#diag-fraction-cancel-x-4e2d" transform="translate(477 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-95f4" transform="translate(489 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-56db" transform="translate(501 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-9879" transform="translate(513 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-62b5" transform="translate(525 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-6389" transform="translate(537 112.4) scale(0.0120)"/><use href="#diag-fraction-cancel-x-4e86" transform="translate(549 112.4) scale(0.0120)"/></g>
</svg>
</figure>

加到 1/(3×4) 为止。写成差之后，1/2 和 1/3 各出现一次正、一次负，抵掉。纸上剩下 1 和 −1/4。


中间项两两抵消，这是裂项相消的全部原理。

<div class="ziyou-viz" id="telescope-viz">
  <div class="viz-caption">选一个项数 n，点“播放”看中间项如何一对对相消，最后只剩首尾两项。也可以点“单步”逐项观察。</div>
  <div class="viz-toolbar">
    <label for="t-n">项数 n：</label><input type="range" id="t-n" min="3" max="10" step="1" value="6" aria-valuetext="6 项"><output class="viz-val" id="t-n-val" for="t-n">6</output>
    <span class="viz-btns">
      <button type="button" id="t-play" aria-pressed="false">▶ 播放</button>
      <button type="button" id="t-step">⏭ 单步</button>
      <button type="button" id="t-reset">↺ 重置</button>
    </span>
  </div>
  <div class="viz-expr" id="t-expr" aria-label="裂项展开式"></div>
  <div class="viz-result" id="t-result" role="status" aria-live="polite" aria-atomic="true"></div>
</div>
<style>
#telescope-viz{margin:1.6em 0;padding:1.2em 1.4em;border:1px solid var(--color-card-border);border-radius:12px;background:var(--color-surface)}
#telescope-viz .viz-caption{color:var(--color-text-muted);font-size:.9em;margin-bottom:1em;line-height:1.5}
#telescope-viz .viz-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:1.2em;margin-bottom:1em}
#telescope-viz .viz-toolbar label{display:flex;align-items:center;gap:.5em;font-size:.9em;color:var(--color-text-strong)}
#telescope-viz .viz-toolbar input[type=range]{width:120px;accent-color:var(--color-link)}
#telescope-viz .viz-val{font-family:Menlo,Consolas,monospace;color:var(--color-link);font-weight:600}
#telescope-viz .viz-btns{display:flex;gap:.5em;flex-wrap:wrap}
#telescope-viz button{padding:.45em .9em;min-height:44px;border:1px solid var(--color-card-border);border-radius:8px;background:transparent;color:var(--color-text-strong);cursor:pointer;font-size:.85em;transition:background .15s,color .15s,border-color .15s}
#telescope-viz button:hover{background:var(--color-link);color:#fff;border-color:var(--color-link)}
#telescope-viz .viz-expr{min-height:3em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.15em;padding:.8em;line-height:2;font-size:1.05em;overflow-x:auto}
#telescope-viz .t-term{display:inline-flex;align-items:center;padding:.1em .2em;border-radius:5px;transition:opacity .4s ease,background .3s ease,transform .3s ease;white-space:nowrap}
#telescope-viz .t-term.t-cancel{opacity:0;transform:scale(.6)}
#telescope-viz .t-term.t-hi{outline:2px solid currentColor;outline-offset:2px}
#telescope-viz .t-term.t-keep{font-weight:600;color:var(--color-link)}
#telescope-viz .t-op{color:var(--color-text-muted);padding:0 .05em}
#telescope-viz .viz-result{margin-top:.6em;text-align:center;color:var(--color-text-strong);min-height:1.6em}
@media (prefers-reduced-motion:reduce){#telescope-viz .t-term{transition:none}#telescope-viz .t-term.t-cancel{transform:none;opacity:.35}}
</style>
<script>
(function(){
  const root=document.getElementById('telescope-viz');if(!root)return;
  const nIn=document.getElementById('t-n'),nVal=document.getElementById('t-n-val');
  const expr=document.getElementById('t-expr'),result=document.getElementById('t-result');
  const playBtn=document.getElementById('t-play'),stepBtn=document.getElementById('t-step'),resetBtn=document.getElementById('t-reset');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let terms=[],ops=[]; // terms: 数组 {k, sign, val}; 相消按值 k 配对
  let cancelQueue=[];  // 待相消的配对索引
  let timer=null,stepAt=0;
  // 配色：用 link 色的不同亮度区分不同数值对
  let pairColor={};
  function readColor(){
    const cs=getComputedStyle(document.documentElement);
    return (cs.getPropertyValue('--color-link').trim())||'#4285f4';
  }
  function build(){
    const n=parseInt(nIn.value,10);nVal.textContent=n;nIn.setAttribute('aria-valuetext',n+' 项');
    stop();
    stepAt=0;expr.innerHTML='';result.textContent='';
    // 生成展开项：1, -1/2, +1/2, -1/3, +1/3, ... -1/(n+1)
    // 第一项 +1（1 - 1/2），之后每对 ( -1/k , +1/k )
    pairColor={};
    const colorBase=readColor();
    terms=[];ops=[];
    // 项序列：+1, -1/2, +1/2, -1/3, +1/3, ... , -1/(n+1)   (注意 +1/2 来自第二对拆分的负项)
    // 实际：第 i 项(i=0..n) 是 (-1)^? ... 用结构化方式生成
    // 项0: +1 ; 项 2j-1: -1/(j+1) ; 项 2j: +1/(j+1)  其中 j=1..n  共 2n+1 项? 
    // 重列：展开 = (1 - 1/2) + (1/2 - 1/3) + ... + (1/n - 1/(n+1))
    // 拍平：1, -1/2, +1/2, -1/3, +1/3, ..., -1/n, +1/n, -1/(n+1)
    const seq=[];
    seq.push({val:1,sign:1});          // +1
    for(let k=2;k<=n+1;k++){
      seq.push({val:1/k,sign:-1});      // -1/k
      if(k<=n)seq.push({val:1/k,sign:1});// +1/k （最后一项 k=n+1 没有 +）
    }
    // 渲染
    seq.forEach((it,i)=>{
      if(i>0){
        const op=document.createElement('span');op.className='t-op';
        op.textContent=it.sign>0?'+':'−';expr.appendChild(op);
      }else if(it.sign<0){
        const op=document.createElement('span');op.className='t-op';op.textContent='−';expr.appendChild(op);
      }
      const span=document.createElement('span');span.className='t-term';
      span.dataset.idx=i;span.dataset.val=it.val;span.dataset.sign=it.sign;
      // 数值文本
      const v=it.val;
      const body=frac(v);
      span.innerHTML=body;
      expr.appendChild(span);
      terms.push(span);
    });
    // 构造相消配对：相邻同值异号 (idx i, i+1) 其中 sign 不同 val 相同
    cancelQueue=[];
    const used=new Set();
    for(let i=0;i<seq.length-1;i++){
      if(used.has(i))continue;
      if(seq[i].val===seq[i+1].val && seq[i].sign!==seq[i+1].sign){
        cancelQueue.push([i,i+1]);
        used.add(i);used.add(i+1);
      }
    }
    // 给每对配不同颜色
    cancelQueue.forEach((pair,pi)=>{
      pairColor[pi]=shade(colorBase,-0.15+pi*0.12);
      pair.forEach(idx=>{
        terms[idx].dataset.pair=pi;
        terms[idx].setAttribute('aria-label',(seq[idx].sign>0?'正':'负')+' 1/'+Math.round(1/seq[idx].val)+'，第 '+(pi+1)+' 对相消项');
      });
    });
    result.textContent='共 '+cancelQueue.length+' 对中间项等待相消。';
  }
  function frac(v){
    // v=1/k 形式，渲染为 1/k；v=1 渲染为 1
    if(v===1)return '1';
    const k=Math.round(1/v);
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-size:.9em"><span>1</span><span style="border-top:1px solid currentColor;width:100%;min-width:.7em"></span><span>'+k+'</span></span>';
  }
  function shade(color,amt){
    // 支持 #rgb/#rrggbb 与 rgb()/rgba()；CSS 变量在明暗主题下都可能变化。
    let r,g,b;
    const rgb=color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if(rgb){r=+rgb[1];g=+rgb[2];b=+rgb[3];}else{
      const c=color.replace('#','');
      if(!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(c))return color;
      const num=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);
      r=(num>>16)&255;g=(num>>8)&255;b=num&255;
    }
    r=Math.round(r+(amt>0?(255-r):r)*amt);g=Math.round(g+(amt>0?(255-g):g)*amt);b=Math.round(b+(amt>0?(255-b):b)*amt);
    return 'rgb('+Math.max(0,Math.min(255,r))+','+Math.max(0,Math.min(255,g))+','+Math.max(0,Math.min(255,b))+')';
  }
  function doStep(){
    if(stepAt>=cancelQueue.length){stop();renderResult();return false;}
    const pair=cancelQueue[stepAt];const col=pairColor[stepAt];
    pair.forEach(idx=>{
      const el=terms[idx];
      el.style.background=col;el.style.color='#fff';
      el.classList.add('t-hi');
    });
    result.textContent='正在相消第 '+stepAt+' 对中间项。';
    setTimeout(()=>{
      pair.forEach(idx=>{terms[idx].classList.add('t-cancel');});
    },reduced.matches?0:350);
    stepAt++;
    return true;
  }
  function renderResult(){
    const n=parseInt(nIn.value,10);
    result.innerHTML='最后只剩首尾两项：';
    const s=document.createElement('span');s.className='t-keep';s.style.color=readColor();
    s.textContent=' 1 − 1/'+(n+1)+' ';
    result.appendChild(s);
    const sum=1-1/(n+1);
    const sumspan=document.createElement('span');
    sumspan.textContent=' = '+(Math.round(sum*1000)/1000);
    result.appendChild(sumspan);
  }
  function play(){
    // 减少动画偏好下不自动连续播放；单步仍可完整观察每一对相消。
    if(reduced.matches){stop();doStep();return;}
    if(timer){stop();return;}
    if(stepAt>=cancelQueue.length)build();
    playBtn.textContent='⏸ 暂停';playBtn.setAttribute('aria-pressed','true');
    timer=setInterval(()=>{
      const ok=doStep();
      if(!ok)stop();
    },800);
  }
  function stop(){
    if(timer){clearInterval(timer);timer=null;}
    playBtn.textContent='▶ 播放';playBtn.setAttribute('aria-pressed','false');
  }
  function reset(){stop();build();}
  playBtn.addEventListener('click',play);
  stepBtn.addEventListener('click',()=>{stop();doStep();});
  resetBtn.addEventListener('click',reset);
  nIn.addEventListener('input',reset);
  new MutationObserver(()=>{build();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  build();
})();
</script>

原来看起来很长的一串数列，其实只要找到拆分方式，就能瞬间变短。

## 三、如果两个数不是相邻的怎么办？

比如：

$$\frac1{2\times5}$$

2 和 5 中间差了 3，不是相邻数。

我们可以这样拆：

$$\frac1{2\times5}=\frac13\left(\frac12-\frac15\right)$$

因为：

$$\frac12-\frac15=\frac{5-2}{2\times5}=\frac3{2\times5}$$

所以要再乘一个 $\frac13$。

一般地：

$$\frac1{n(n+k)}=\frac1k\left(\frac1n-\frac1{n+k}\right)$$

这里的关键不是死背公式，而是看懂：**分母中两个数差多少，前面就要除以多少**。

## 四、三个连续因子的裂项

再往上走一层，比如：

$$\frac1{n(n+1)(n+2)}$$

它也可以裂项：

$$\frac1{n(n+1)(n+2)}=\frac12\left[\frac1{n(n+1)}-\frac1{(n+1)(n+2)}\right]$$

为什么前面是 $\frac12$？

因为：

$$\frac1{n(n+1)}-\frac1{(n+1)(n+2)}=\frac{2}{n(n+1)(n+2)}$$

所以要乘 $\frac12$，才能变成原来的式子。

这其实还是通分，只是形式更复杂了。

## 五、从"分数裂项"反过来看"乘积求和"

裂项不仅能处理分数，也可以反过来处理乘积求和。

比如要求：

$$1\times2+2\times3+3\times4+\cdots+n(n+1)$$

可以把每一项写成两个更大乘积的差：

$$k(k+1)=\frac13\left[k(k+1)(k+2)-(k-1)k(k+1)\right]$$

因为相减时公因式 $k(k+1)$ 被保留下来，括号部分给出一个差值 3：

$$k(k+1)[(k+2)-(k-1)] = 3k(k+1)$$

所以前面要乘 $\frac13$。

于是：

$$1\times2+2\times3+\cdots+n(n+1)=\frac13 n(n+1)(n+2)$$

例如：

$$1\times2+2\times3+\cdots+99\times100=\frac13\times99\times100\times101$$

这比一项一项地加起来快得多。

## 六、平方和公式也可以这样理解

常见的平方和公式是：

$$1^2+2^2+3^2+\cdots+n^2=\frac{n(n+1)(2n+1)}6$$

很多人只会背，但我们可以把它拆成更熟悉的东西。

注意：

$$k^2=k(k-1)+k$$

所以：

$$1^2+2^2+3^2+\cdots+n^2$$

可以拆成：

$$[0\times1+1\times2+2\times3+\cdots+(n-1)n]+[1+2+3+\cdots+n]$$

第一部分是前面讲过的乘积求和：

$$0\times1+1\times2+\cdots+(n-1)n=\frac{(n-1)n(n+1)}3$$

第二部分是等差数列求和：

$$1+2+3+\cdots+n=\frac{n(n+1)}2$$

合起来：

$$\frac{(n-1)n(n+1)}3+\frac{n(n+1)}2$$

通分整理后得到：

$$\frac{n(n+1)(2n+1)}6$$

这就是平方和公式的来源。

## 七、这一类的共同结构

从相邻分数、隔数分数、三因子裂项，到乘积求和、平方和公式，用的都是同一个动作：**把一项拆成两项之差，让中间项成对抵消**。

遇到求和式时，先看能不能写成 $f(n)-f(n+1)$ 的形式。能写成这个形式，中间项自动消掉，剩下的只有首尾两项。
