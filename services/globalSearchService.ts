import { initialCases } from '../data/caseData';
import { initialExtendedEmployees, ExtendedEmployee } from '../data/employeeExtendedData';
import { 
  mockProperties, 
  mockTenants, 
  mockLeaseAgreements, 
} from '../data/propertyData';
import { initialMockCompanies, initialMockMeetings, initialMockDocuments } from '../data/companyMockData';
import { mockAnalyzedContracts } from '../data/contractAnalysisData';
import { initialMockTasks } from '../data/taskData';
import { 
  initialPolicies, 
  initialObligations, 
  initialRisks, 
  initialViolations 
} from '../pages/compliance/data';
import { 
  Case, 
  Employee, 
  LeaseAgreement, 
  Property, 
  CompanyProfile, 
  CompanyMeeting, 
  CompanyDocument, 
  AdminTask,
  AdminTaskStatus,
  CompanyDocumentStatus,
  AnalyzedContract,
  PropertyUnitStatus,
  LeaseAgreementStatus,
  RiskLevel
} from '../types';
import { 
  PolicyProfile, 
  ObligationProfile, 
  RiskRegisterProfile, 
  ViolationProfile 
} from '../pages/compliance/types';

export interface SearchItem {
  id: string;
  name: string;
  nameEn?: string;
  type: string;        // Record Type (Arabic) e.g., "قضية", "موظف"
  typeEn: string;      // Record Type (English) e.g., "Case", "Employee"
  section: string;     // System Section (Arabic) e.g., "إدارة القضايا"
  sectionEn: string;   // System Section (English) e.g., "Case Management"
  number: string;      // File, Civil ID, automated or record identification number
  date: string;        // Creation date, action date, filing date or similar
  status: string;      // Standard status (Arabic/translated)
  statusType: 'success' | 'warning' | 'danger' | 'info' | 'default';
  description: string; // Dynamic text summarizing the record fields
  link: string;        // Navigation landing URL with query params
  
  // Specific searchable properties for advanced filters
  operator?: string;   // Lawyer or assignee or creator
  court?: string;      // Court name if matching (cases, hearings, etc.)
  client?: string;     // Client or beneficiary if matching
  employee?: string;   // Employee related to HR records
  property?: string;   // Property related to property management index
  
  // Weights / Relevance data
  raw?: any;           // Original raw object
}

export interface SearchFilters {
  searchTerm?: string;
  section?: string | 'All';
  recordType?: string | 'All';
  status?: string | 'All';
  operator?: string;
  court?: string;
  client?: string;
  employee?: string;
  property?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class GlobalSearchEngine {
  private static indexedItems: SearchItem[] = [];

  /**
   * Builds the central searchable index from all current modules in the Adala system.
   */
  public static buildIndex(): SearchItem[] {
    const items: SearchItem[] = [];

    // 1. Index Cases
    try {
      initialCases.forEach((c: Case) => {
        items.push({
          id: `case-${c.id}`,
          name: c.title,
          type: 'قضية كبرى',
          typeEn: 'Case',
          section: 'إدارة القضايا',
          sectionEn: 'Case Management',
          number: c.caseNumber || 'N/A',
          date: c.filingDate || c.createdDate || '',
          status: this.translateStatus(c.status),
          statusType: this.getStatusType(c.status),
          description: `الموكل: ${c.clientName} (${c.clientRole}) | الخصم: ${c.opposingPartyName} | المحكمة: ${c.courtName} - الدائرة: ${c.circuit || 'N/A'} | المستشار: ${c.assignedLawyer} | رقم داخلي: ${c.internalCaseNumber || 'N/A'} | ملف المكتب: ${c.fileNumber || 'N/A'}`,
          link: `/cases/${c.id}`,
          operator: c.assignedLawyer,
          court: c.courtName,
          client: c.clientName,
          raw: c
        });

        // Index Case Hearings if any
        if (c.hearings && c.hearings.length > 0) {
          c.hearings.forEach(h => {
            items.push({
              id: `hearing-${c.id}-${h.id}`,
              name: `جلسة ${h.type} في قضية ${c.caseNumber}`,
              type: 'جلسة محاكمة',
              typeEn: 'Hearing',
              section: 'الرول والجلسات',
              sectionEn: 'Litigation Management',
              number: c.caseNumber || 'N/A',
              date: h.date,
              status: h.status === 'Completed' ? 'منجزة الجلسة' : 'مجدولة بانتظار الانعقاد',
              statusType: h.status === 'Completed' ? 'success' : 'warning',
              description: `قضية الموكل ${c.clientName} ضد ${c.opposingPartyName} | القاضي: ${c.judgeName || 'N/A'} | ملاحظات الجلسة: ${h.notes || 'لا يوجد'} | قاعة المحكمة: ${c.circuit || 'N/A'}`,
              link: `/cases/${c.id}`,
              operator: c.assignedLawyer,
              court: c.courtName,
              client: c.clientName,
              raw: h
            });
          });
        }
      });
    } catch (e) {
      console.error('Error indexing cases:', e);
    }

    // 2. Index Employees (HR Department)
    try {
      initialExtendedEmployees.forEach((emp: ExtendedEmployee) => {
        const salaryText = `الراتب الأساسي: ${emp.basicSalary} د.ك | البدلات: ${emp.allowances.map(a => a.name + ': ' + a.value).join('، ')}`;
        items.push({
          id: `employee-${emp.id}`,
          name: emp.fullNameAr,
          nameEn: emp.fullNameEn,
          type: 'موظف',
          typeEn: 'Employee',
          section: 'شؤون الموظفين',
          sectionEn: 'Personnel Affairs',
          number: emp.employeeId,
          date: emp.joiningDate,
          status: emp.status === 'Active' ? 'على رأس عمله' : 'منتهي الخدمة',
          statusType: emp.status === 'Active' ? 'success' : 'danger',
          description: `المسمى الوظيفي: ${emp.jobTitle} | القسم: ${emp.department} | الرقم المدني: ${emp.civilId} | الهاتف: ${emp.phone} | البريد: ${emp.email} | رقم الضمان الاجتماعي: ${emp.socialSecurityNumber || 'N/A'} | ${salaryText}`,
          link: `/employee-affairs/profiles?id=${emp.id}`,
          employee: emp.fullNameAr,
          raw: emp
        });

        // Index Leave Requests per employee
        if (emp.leaveRequests && emp.leaveRequests.length > 0) {
          emp.leaveRequests.forEach(l => {
            items.push({
              id: `leave-${emp.id}-${l.id}`,
              name: `طلب ${l.type} - الموظف ${emp.fullNameAr}`,
              type: 'طلب إجازة',
              typeEn: 'Leave Request',
              section: 'إدارة الإجازات',
              sectionEn: 'Leave Management',
              number: emp.employeeId,
              date: l.requestedAt?.split(' ')[0] || l.startDate,
              status: l.status === 'Approved' ? 'معتمدة ومقبولة' : l.status === 'Rejected' ? 'مرفوضة إدارياً' : 'قيد المراجعة والاعتماد',
              statusType: l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning',
              description: `المدة: ${l.days} أيام من تاريخ ${l.startDate} إلى ${l.endDate} | السبب المستند: ${l.reason || 'لا يوجد'} | الموافقات: ${l.approvals?.map(a => a.name + ' (' + a.role + ')').join(' | ')}`,
              link: `/employee-affairs/leave-management?empId=${emp.id}`,
              employee: emp.fullNameAr,
              raw: l
            });
          });
        }

        // Index Loans / Advances
        if (emp.loans && emp.loans.length > 0) {
          emp.loans.forEach(loan => {
            items.push({
              id: `loan-${emp.id}-${loan.id}`,
              name: `قرض وسلفة للموظف ${emp.fullNameAr}`,
              type: 'القروض والسلف',
              typeEn: 'Loans & Advances',
              section: 'شؤون الموظفين',
              sectionEn: 'Personnel Affairs',
              number: emp.employeeId,
              date: loan.issueDate,
              status: loan.status === 'Active' ? 'مستمر السداد' : loan.status === 'Paid' ? 'مسدد بالكامل' : 'متأخر في السداد',
              statusType: loan.status === 'Active' ? 'info' : loan.status === 'Paid' ? 'success' : 'danger',
              description: `مبلغ القرض الكلي: ${loan.principalAmount} د.ك | القسط الشهري: ${loan.monthlyInstallment} د.ك | المتبقي غير المسدد: ${loan.balanceAmount} د.ك | تاريخ الاستحقاق النهائي: ${loan.maturityDate}`,
              link: `/employee-affairs/loans?empId=${emp.id}`,
              employee: emp.fullNameAr,
              raw: loan
            });
          });
        }

        // Index Administrative Investigations
        if (emp.investigations && emp.investigations.length > 0) {
          emp.investigations.forEach(inv => {
            items.push({
              id: `investigation-${emp.id}-${inv.id}`,
              name: `تحقيق إداري رقم ${inv.caseNumber} - الموظف ${emp.fullNameAr}`,
              type: 'تحقيق إداري',
              typeEn: 'Administrative Investigation',
              section: 'التحقيقات الإدارية والجزاءات',
              sectionEn: 'Personnel Affairs',
              number: inv.caseNumber,
              date: inv.date,
              status: inv.status === 'Open' ? 'جاري التحقيق' : inv.status === 'Closed' ? 'مغلق ومحفوظ' : 'مؤرشف بملف الموظف',
              statusType: inv.status === 'Open' ? 'warning' : inv.status === 'Closed' ? 'success' : 'info',
              description: `موضوع التحقيق: ${inv.subject} | المحقق القانوني المسؤول: ${inv.investigator} | التوصيات والنتائج: ${inv.results} (${inv.recommendations}) | العقوبة المقترحة: ${inv.penaltyProposed || 'لا يوجد'}`,
              link: `/employee-affairs/investigations?id=${inv.id}`,
              employee: emp.fullNameAr,
              raw: inv
            });
          });
        }

        // Index Disciplinary Actions / Penalties
        if (emp.disciplinaryActions && emp.disciplinaryActions.length > 0) {
          emp.disciplinaryActions.forEach(da => {
            items.push({
              id: `disciplinary-${emp.id}-${da.id}`,
              name: `قرار جزاء تأديبي - الموظف ${emp.fullNameAr}`,
              type: 'جزاء تأديبي',
              typeEn: 'Disciplinary Action',
              section: 'التحقيقات الإدارية والجزاءات',
              sectionEn: 'Personnel Affairs',
              number: da.id,
              date: da.violationDate,
              status: da.status === 'Approved' ? 'نافذ ومصادق عليه' : da.status === 'Pending' ? 'مسودة قيد الاعتماد' : 'مستأنف للجنة التظلمات',
              statusType: da.status === 'Approved' ? 'danger' : da.status === 'Pending' ? 'warning' : 'info',
              description: `نوع المخالفة المرتكبة: ${da.violationType} | تفاصيل الواقعة: ${da.violationDetails} | العقوبة المفروضة: ${da.penalty} | مبلغ الاقتطاع: ${da.penaltyAmount ? da.penaltyAmount + ' د.ك' : 'لا يوجد'} | التحذيرات الرسمية: ${da.warningsIssued || 'N/A'}`,
              link: `/employee-affairs/disciplinary?empId=${emp.id}`,
              employee: emp.fullNameAr,
              raw: da
            });
          });
        }

        // Index Appraisals
        if (emp.evaluations && emp.evaluations.length > 0) {
          emp.evaluations.forEach(ev => {
            items.push({
              id: `appraisal-${emp.id}-${ev.id}`,
              name: `تقييم الأداء السنوي - الموظف ${emp.fullNameAr}`,
              type: 'تقييم أداء وتطوير',
              typeEn: 'Performance Appraisal',
              section: 'تقييم الأداء والامتثال الوظيفي',
              sectionEn: 'Personnel Affairs',
              number: ev.period,
              date: ev.date,
              status: ev.overallScore >= 90 ? 'ممتاز' : ev.overallScore >= 80 ? 'جيد جداً' : ev.overallScore >= 70 ? 'جيد' : 'بحاجة للتطوير',
              statusType: ev.overallScore >= 85 ? 'success' : ev.overallScore >= 70 ? 'info' : 'warning',
              description: `دورة التقييم: ${ev.period} | النسبة الإجمالية: ${ev.overallScore}% | المقيم المختص: ${ev.evaluatorName} | الملاحظات القانونية والتطويرية: ${ev.qualitativeFeedback} | الأهداف المحققة للمكتب: ${ev.objectivesMet?.join('، ') || 'N/A'}`,
              link: `/employee-affairs/performance?empId=${emp.id}`,
              employee: emp.fullNameAr,
              raw: ev
            });
          });
        }

        // Index Administrative Requests
        if (emp.administrativeRequests && emp.administrativeRequests.length > 0) {
          emp.administrativeRequests.forEach(req => {
            items.push({
              id: `emp-req-${emp.id}-${req.id}`,
              name: `طلب إداري (${req.type}) - الموظف ${emp.fullNameAr}`,
              type: 'طلبات الموظفين',
              typeEn: 'Employee Request',
              section: 'طلبات الموظفين والخدمات الذاتية',
              sectionEn: 'Personnel Affairs',
              number: req.id,
              date: req.requestedDate,
              status: req.status === 'Approved' ? 'تم الموافقة عليه' : req.status === 'Rejected' ? 'مرفوض إدارياً' : 'جاري التدقيق فيه والاعتماد',
              statusType: req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning',
              description: `تفاصيل الطلب: ${req.details} | ملاحظات إدارة الموارد البشرية والامتثال: ${req.hrNotes || 'لا يوجد'}`,
              link: `/employee-affairs/requests?empId=${emp.id}`,
              employee: emp.fullNameAr,
              raw: req
            });
          });
        }
      });
    } catch (e) {
      console.error('Error indexing employees:', e);
    }

    // 3. Index Properties (Real Estate Department)
    try {
      mockProperties.forEach((p: Property) => {
        const unitsCount = p.units?.length || 0;
        items.push({
          id: `property-${p.id}`,
          name: p.name,
          type: 'عقار تجاري/استثماري',
          typeEn: 'Property',
          section: 'إدارة العقارات والوحدات',
          sectionEn: 'Property Management',
          number: p.paciNumber || p.id,
          date: p.createdAt || '2025-01-01',
          status: p.status === PropertyUnitStatus.RENTED ? 'مشغول بالكامل' : 'شاغر ومثبت',
          statusType: p.status === PropertyUnitStatus.RENTED ? 'success' : 'warning',
          description: `عنوان العقار بمكانه: ${p.address} | المالك القانوني: ${p.ownerName || 'المكتب'} | الرقم المدني PACI: ${p.paciNumber || 'N/A'} | عدد الوحدات: ${unitsCount} | تصنيف فئة العقار: ${p.propertyCategory || 'N/A'}`,
          link: `/property-management?propertyId=${p.id}`,
          property: p.name,
          raw: p
        });

        // Index Units inside property if available
        if (p.units && p.units.length > 0) {
          p.units.forEach(unit => {
            const rentVal = unit.rentAmount || 0;
            const sizeVal = unit.areaSqM || 0;
            const useText = unit.intendedUse || 'تجاري';
            items.push({
              id: `property-unit-${p.id}-${unit.id}`,
              name: `شقة/مكتب رقم ${unit.unitNumber} - ${p.name}`,
              type: 'وحدة عقارية',
              typeEn: 'Property Unit',
              section: 'إدارة العقارات والوحدات',
              sectionEn: 'Property Management',
              number: unit.unitNumber,
              date: p.createdAt || '2025-01-01',
              status: unit.status === PropertyUnitStatus.RENTED ? 'مؤجرة وموثقة' : unit.status === PropertyUnitStatus.VACANT ? 'شاغرة للتعاقد' : 'قيد الصيانة والتجهيز',
              statusType: unit.status === PropertyUnitStatus.RENTED ? 'success' : unit.status === PropertyUnitStatus.VACANT ? 'warning' : 'danger',
              description: `قيمة الإيجار: ${rentVal} د.ك | نوع التخصيص: ${useText} | المساحة الإجمالية: ${sizeVal} متر مربع | الطابق: ${unit.floor || 'N/A'}`,
              link: `/property-management?propertyId=${p.id}`,
              property: p.name,
              raw: unit
            });
          });
        }
      });
    } catch (e) {
      console.error('Error indexing properties:', e);
    }

    // 4. Index Tenants
    try {
      mockTenants.forEach(t => {
        items.push({
          id: `tenant-${t.id}`,
          name: t.fullNameAr,
          type: 'مستأجر عقاري',
          typeEn: 'Tenant',
          section: 'إدارة المستأجرين والعقارات',
          sectionEn: 'Property Management',
          number: t.civilIdOrPassport,
          date: '2025-01-01',
          status: 'عقد فعال',
          statusType: 'success',
          description: `الرقم المدني للمستأجر: ${t.civilIdOrPassport} | الهاتف المباشر: ${t.phone} | البريد: ${t.email || 'N/A'} | الجنسية: ${t.nationality} | العنوان: ${t.address || 'N/A'}`,
          link: `/property-management`,
          client: t.fullNameAr,
          raw: t
        });
      });
    } catch (e) {
      console.error('Error indexing tenants:', e);
    }

    // 5. Index Lease Agreements (عقود الإيجار والالتزامات)
    try {
      mockLeaseAgreements.forEach((la: LeaseAgreement) => {
        items.push({
          id: `lease-${la.id}`,
          name: `عقد إيجار رقم ${la.contractNumber}`,
          type: 'عقد إيجار رسمي',
          typeEn: 'Lease Agreement',
          section: 'إدارة العقود العقارية',
          sectionEn: 'Property Management',
          number: la.contractNumber,
          date: la.startDate,
          status: la.status === LeaseAgreementStatus.ACTIVE ? 'عقد ساري المفعول' : la.status === LeaseAgreementStatus.EXPIRED ? 'منتهي ومفسوخ' : 'مسودة قيد النظر والاعتماد',
          statusType: la.status === LeaseAgreementStatus.ACTIVE ? 'success' : la.status === LeaseAgreementStatus.EXPIRED ? 'danger' : 'warning',
          description: `المستأجر الكود: ${la.tenantId} | قيمة الإيجار: ${la.rentAmount} د.ك | تواتر الدفع: ${la.rentFrequency} | تاريخ البدء: ${la.startDate} | تاريخ الانتهاء: ${la.endDate} | مبلغ التأمين العقاري: ${la.depositAmount || 0} د.ك | غرامات فوات السداد: ${la.latePaymentFee || 0} د.ك`,
          link: `/property-management?leaseId=${la.id}`,
          raw: la
        });
      });
    } catch (e) {
      console.error('Error indexing lease agreements:', e);
    }

    // 6. Index Companies (إدارة قطاع الشركات والجمعيات والمجالس)
    try {
      initialMockCompanies.forEach((comp: CompanyProfile) => {
        items.push({
          id: `company-${comp.id}`,
          name: comp.companyNameAr,
          type: 'شركة تجارية نشطة',
          typeEn: 'Company',
          section: 'شؤون حوكمة الشركات',
          sectionEn: 'Corporate Affairs',
          number: comp.tradeLicenseNumber || comp.registrationNumber || 'N/A',
          date: comp.establishmentDate,
          status: 'كيان تجاري قائم',
          statusType: 'success',
          description: `الاسم بالإنجليزية: ${comp.companyNameEn || ''} | الشكل القانوني ذ.م.م: ${comp.legalForm} | الرقم التجاري الموحد: ${comp.registrationNumber || 'N/A'} | رأس المال المعتمد: ${comp.capital || 0} د.ك | العنوان الرئيسي: ${comp.headOfficeAddress} | البريد: ${comp.contactInfo?.email || 'N/A'}`,
          link: `/company-affairs?companyId=${comp.id}`,
          raw: comp
        });

        // Board member directory search
        if (comp.boardMembers && comp.boardMembers.length > 0) {
          comp.boardMembers.forEach(bm => {
            items.push({
              id: `boardmember-${comp.id}-${bm.id}`,
              name: `عضو مجلس إدارة: ${bm.name}`,
              type: 'مجلس الإدارة والحوكمة',
              typeEn: 'Board Member',
              section: 'شؤون حوكمة الشركات',
              sectionEn: 'Corporate Affairs',
              number: bm.id || comp.registrationNumber,
              date: comp.establishmentDate,
              status: 'عضو فعال ومصدق',
              statusType: 'success',
              description: `شركة: ${comp.companyNameAr} | منصب العضو: ${bm.position} | تاريخ التعيين والمباشرة: ${bm.appointmentDate} | نهاية الدورة الحالية: ${bm.termEndDate}`,
              link: `/company-affairs?companyId=${comp.id}`,
              raw: bm
            });
          });
        }
      });
    } catch (e) {
      console.error('Error indexing companies:', e);
    }

    // 7. Index Corporate Meetings & Documents
    try {
      initialMockMeetings.forEach((meet: CompanyMeeting) => {
        items.push({
          id: `meeting-${meet.id}`,
          name: `محضر اجتماع مجلس إدارة: ${meet.meetingType}`,
          type: 'جمعيات واجتماعات',
          typeEn: 'Corporate Meeting',
          section: 'شؤون حوكمة الشركات',
          sectionEn: 'Corporate Affairs',
          number: meet.id,
          date: meet.meetingDate,
          status: 'محضر مدون ومثبت',
          statusType: 'success',
          description: `تاريخ الاجتماع: ${meet.meetingDate} | الموقع: ${meet.meetingLocation || 'المقر الرئيسي'} | الحضور المصدق: ${meet.attendees?.join('، ') || 'N/A'} | أجندة المقررات: ${meet.agendaItems || 'N/A'} | قرارات وتوصيات مبرمة: ${meet.resolutionsPassed || 'N/A'}`,
          link: `/company-affairs`,
          raw: meet
        });
      });

      initialMockDocuments.forEach((doc: CompanyDocument) => {
        items.push({
          id: `company-doc-${doc.id}`,
          name: doc.title,
          type: 'مستند شركة رسمي',
          typeEn: 'Corporate Document',
          section: 'شؤون حوكمة الشركات',
          sectionEn: 'Corporate Affairs',
          number: doc.id,
          date: doc.documentDate,
          status: doc.status === CompanyDocumentStatus.APPROVED || doc.status === CompanyDocumentStatus.ACTIVE ? 'ساري المفعول والاعتماد' : 'قيد المراجعة الفنية والتوقيع',
          statusType: doc.status === CompanyDocumentStatus.APPROVED || doc.status === CompanyDocumentStatus.ACTIVE ? 'success' : 'warning',
          description: `نوع المستند والمذكرات: ${doc.documentType} | تاريخ إصدار الوثيقة: ${doc.documentDate} | رابط الأرشفة الرقمية: ${doc.filePathOrLink || 'pdf_document'} | الملاحظات القانونية: ${doc.notes || 'لا يوجد'}`,
          link: `/company-affairs`,
          raw: doc
        });
      });
    } catch (e) {
      console.error('Error indexing corporate components:', e);
    }

    // 8. Index Analyzed Contracts (إدارة قطاع صياغة وتحليل العقود)
    try {
      mockAnalyzedContracts.forEach((contract: AnalyzedContract) => {
        const partiesText = `${contract.parties.firstParty} ضد ${contract.parties.secondParty}`;
        items.push({
          id: `analyzed-contract-${contract.id}`,
          name: contract.title || `تحليل عقد: ${contract.referenceNumber}`,
          type: 'عقد محلل بالذكاء الاصطناعي',
          typeEn: 'Analyzed Contract',
          section: 'العقود وصياغة الاتفاقيات',
          sectionEn: 'Contracts Management',
          number: contract.referenceNumber || 'N/A',
          date: contract.dates.signedDate || contract.dates.effectiveDate || '',
          status: contract.overallRisk === RiskLevel.CRITICAL || contract.overallRisk === RiskLevel.HIGH ? 'مخاطر حاسمة وعالية' : 'عقد خاضع للمعايير وآمن',
          statusType: contract.overallRisk === RiskLevel.CRITICAL || contract.overallRisk === RiskLevel.HIGH ? 'danger' : 'success',
          description: `أطراف التعاقد بالصيغة: ${partiesText} | مستوى المخاطر: ${contract.overallRisk} | القيمة المالية: ${contract.financials?.value || 0} ${contract.financials?.currency || 'د.ك'} | ملخص الضمانات والثغرات: ${contract.summary}`,
          link: `/contracts`,
          raw: contract
        });
      });
    } catch (e) {
      console.error('Error indexing analyzed contracts:', e);
    }

    // 9. Index Compliance and Corporate Policies
    try {
      initialPolicies.forEach((pol: PolicyProfile) => {
        items.push({
          id: `compliance-policy-${pol.id}`,
          name: pol.title,
          type: 'سياسة امتثال داخلية',
          typeEn: 'Compliance Policy',
          section: 'الامتثال والالتزامات الدولية والمحلية',
          sectionEn: 'Compliance & Governance',
          number: pol.code,
          date: pol.effectiveDate,
          status: pol.statusAr || 'معتمد وساري',
          statusType: pol.status === 'Approved' ? 'success' : 'warning',
          description: `كود المراجعة: ${pol.code} | المستوى العام لمخاطر الإخلال: ${this.translateRisk(pol.riskLevel)} | مسؤول الملف والسياسات: ${pol.owner || 'N/A'} | ملاحظات الامتثال الفنية: ${pol.notes || ''} | المرفقات المصحوبة: ${pol.attachments?.join('، ') || 'N/A'}`,
          link: `/compliance`,
          raw: pol
        });
      });

      initialObligations.forEach((obl: ObligationProfile) => {
        items.push({
          id: `compliance-obligation-${obl.id}`,
          name: obl.title,
          type: 'التزام قانوني تنظيمي',
          typeEn: 'Compliance Obligation',
          section: 'الامتثال والالتزامات الدولية والمحلية',
          sectionEn: 'Compliance & Governance',
          number: obl.id,
          date: obl.dueDate || '2026-06-30',
          status: obl.statusAr || 'قائم وقيد المتابعة',
          statusType: obl.status === 'Compliant' ? 'success' : obl.status === 'Under Review' ? 'warning' : 'danger',
          description: `تفاصيل الالتزام الإجباري: ${obl.description || obl.title} | الجهة الرقابية المشرفة بوزارة الدولة: ${obl.authority} | وتيرة الامتثال: ${obl.frequency} | الملاحظات القانونية: ${obl.notes || ''} | المكلف بالمتابعة: ${obl.assignedTo}`,
          link: `/compliance`,
          raw: obl
        });
      });

      initialRisks.forEach((risk: RiskRegisterProfile) => {
        items.push({
          id: `compliance-risk-${risk.id}`,
          name: risk.title,
          type: 'مخاطر رقابية مرصودة',
          typeEn: 'Regulatory Risk',
          section: 'الامتثال والالتزامات الدولية والمحلية',
          sectionEn: 'Compliance & Governance',
          number: risk.id,
          date: risk.targetDate || '2026-05-31',
          status: risk.statusAr || 'تحت الاحتواء والمراقبة',
          statusType: risk.riskLevel === RiskLevel.CRITICAL ? 'danger' : risk.riskLevel === RiskLevel.HIGH ? 'warning' : 'info',
          description: `تصنيف المخاطر: ${risk.category} | الاحتمالية الرياضية للحدوث: ${risk.likelihoodScore}/5 | تقييم التأثير المالي: ${risk.impactScore}/5 | خطة المعالجة والاحتواء المبرمة: ${risk.mitigationPlan}`,
          link: `/compliance`,
          raw: risk
        });
      });

      initialViolations.forEach((vio: ViolationProfile) => {
        items.push({
          id: `compliance-violation-${vio.id}`,
          name: `بلاغ مخالفة امتثال: ${vio.title}`,
          type: 'مخالفة امتثال مرصودة',
          typeEn: 'Compliance Violation',
          section: 'الامتثال والالتزامات الدولية والمحلية',
          sectionEn: 'Compliance & Governance',
          number: vio.id,
          date: vio.incidentDate,
          status: vio.statusAr || 'قيد البت والتحصيل والتحقيق الفني',
          statusType: vio.status === 'Closed_Resolved' || vio.status === 'Closed_Paid' ? 'success' : vio.status === 'Under Appeal' ? 'warning' : 'danger',
          description: `تفاصيل البلاغ: ${vio.description} | المكلف بالتحقق: ${vio.assignedTo} | الهيئة الرقابة الكويتية المصدرة للمخالفة: ${vio.authority} | قيمة الغرامة القضائية: ${vio.penaltyAmount} د.ك | الإجراءات التصحيحية المتخذة من القلم: ${vio.correctiveActions?.join('، ')}`,
          link: `/compliance`,
          raw: vio
        });
      });
    } catch (e) {
      console.error('Error indexing compliance:', e);
    }

    // 10. Index Administrative Tasks
    try {
      initialMockTasks.forEach((task: AdminTask) => {
        items.push({
          id: `task-${task.id}`,
          name: task.title,
          type: 'مهمة إدارية وقضائية',
          typeEn: 'Admin Task',
          section: 'أدوات الإدارة والمهام والقسم القانوني',
          sectionEn: 'Administrative Tools',
          number: task.id,
          date: task.dueDate,
          status: this.translateTaskStatus(task.status),
          statusType: task.status === AdminTaskStatus.COMPLETED ? 'success' : task.status === AdminTaskStatus.IN_PROGRESS ? 'warning' : 'info',
          description: `تفاصيل العمل والمشروع المطلوب: ${task.description || ''} | المحامي أو الإداري الموكل إليه التنفيذ: ${task.assignedTo || 'غير محدد'} | مستوى الأولوية: ${this.translateTaskPriority(task.priority)} | القضية أو الكيان المرتبط: ${task.relatedCaseId || 'لا يوجد'}`,
          link: `/admin-tools/tasks`,
          operator: task.assignedTo,
          raw: task
        });
      });
    } catch (e) {
      console.error('Error indexing tasks:', e);
    }

    this.indexedItems = items;
    return items;
  }

  /**
   * Helper to perform smart full-text fuzzy and fragment searching across the compiled index.
   */
  public static search(filters: SearchFilters): { items: SearchItem[]; count: number } {
    if (this.indexedItems.length === 0) {
      this.buildIndex();
    }

    let items = [...this.indexedItems];
    const term = (filters.searchTerm || '').trim().toLowerCase();

    // 1. Full-text search matching across fields
    if (term) {
      items = items.filter(item => {
        const titleMatch = item.name.toLowerCase().includes(term);
        const titleEnMatch = item.nameEn ? item.nameEn.toLowerCase().includes(term) : false;
        const typeMatch = item.type.toLowerCase().includes(term);
        const codeMatch = item.number.toLowerCase().includes(term);
        const descMatch = item.description.toLowerCase().includes(term);
        const statusMatch = item.status.toLowerCase().includes(term);
        const sectionMatch = item.section.toLowerCase().includes(term);

        // Word fragments &compound names support (split search words)
        const parts = term.split(/\s+/);
        if (parts.length > 1) {
          const rawJoined = `${item.name} ${item.number} ${item.description} ${item.type} ${item.section}`.toLowerCase();
          return parts.every(p => rawJoined.includes(p));
        }

        return titleMatch || titleEnMatch || typeMatch || codeMatch || descMatch || statusMatch || sectionMatch;
      });

      // Simple Relevance Calculation and Sorting
      // Match in Code or Number gets +10 points
      // Exact Match in Name/Title gets +8 points
      // Starts with term in Name/Title gets +5 points
      // Substring Match in Name/Title gets +3 points
      // Substring Match in Description gets +1 point
      const scoredItems = items.map(item => {
        let score = 0;
        const nameLow = item.name.toLowerCase();
        const numberLow = item.number.toLowerCase();
        const descLow = item.description.toLowerCase();

        if (numberLow === term) score += 10;
        else if (numberLow.includes(term)) score += 5;

        if (nameLow === term) score += 8;
        else if (nameLow.startsWith(term)) score += 5;
        else if (nameLow.includes(term)) score += 3;

        if (descLow.includes(term)) score += 1;

        return { item, score };
      });

      scoredItems.sort((a, b) => b.score - a.score);
      items = scoredItems.map(si => si.item);
    }

    // 2. Advanced Filters Apply

    // Section Filter
    if (filters.section && filters.section !== 'All') {
      items = items.filter(item => {
        const secLower = item.section.toLowerCase();
        const filtSecLower = (filters.section || '').toLowerCase();
        return secLower.includes(filtSecLower) || item.section === filters.section;
      });
    }

    // Record Type Filter
    if (filters.recordType && filters.recordType !== 'All') {
      items = items.filter(item => item.type === filters.recordType || item.typeEn === filters.recordType);
    }

    // Status Filter
    if (filters.status && filters.status !== 'All') {
      items = items.filter(item => item.status.includes(filters.status!) || item.raw?.status === filters.status);
    }

    // Operator / Lawyer Filter
    if (filters.operator) {
      const opLow = filters.operator.toLowerCase();
      items = items.filter(item => item.operator?.toLowerCase().includes(opLow));
    }

    // Court Filter
    if (filters.court) {
      const crtLow = filters.court.toLowerCase();
      items = items.filter(item => item.court?.toLowerCase().includes(crtLow));
    }

    // Client Filter
    if (filters.client) {
      const cliLow = filters.client.toLowerCase();
      items = items.filter(item => item.client?.toLowerCase().includes(cliLow));
    }

    // Employee Filter
    if (filters.employee) {
      const empLow = filters.employee.toLowerCase();
      items = items.filter(item => item.employee?.toLowerCase().includes(empLow) || item.raw?.fullNameAr?.toLowerCase().includes(empLow));
    }

    // Property Filter
    if (filters.property) {
      const propLow = filters.property.toLowerCase();
      items = items.filter(item => item.property?.toLowerCase().includes(propLow) || item.raw?.propertyName?.toLowerCase().includes(propLow));
    }

    // Date From Filter
    if (filters.dateFrom) {
      items = items.filter(item => item.date >= filters.dateFrom!);
    }

    // Date To Filter
    if (filters.dateTo) {
      items = items.filter(item => item.date <= filters.dateTo!);
    }

    return {
      items,
      count: items.length
    };
  }

  /**
   * Helper Translations and Status Types mapping dynamically to system definitions
   */
  private static translateStatus(status: any): string {
    switch (status) {
      case 'In_Progress': return 'متداولة بالجلسات';
      case 'Open': return 'قضية مفتوحة';
      case 'Closed': return 'محسومة بحكم مبرم';
      case 'Suspended': return 'موقوفة تعليقاً';
      default: return String(status || 'متداول');
    }
  }

  private static getStatusType(status: any): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    switch (status) {
      case 'In_Progress': return 'warning';
      case 'Open': return 'info';
      case 'Closed': return 'success';
      case 'Suspended': return 'danger';
      default: return 'default';
    }
  }

  private static translateRisk(level: RiskLevel): string {
    switch (level) {
      case RiskLevel.CRITICAL: return 'كارثية وحرجة للغاية';
      case RiskLevel.HIGH: return 'عالية الأولوية والخطورة';
      case RiskLevel.MEDIUM: return 'متوسطة الأثر ومحتواة';
      case RiskLevel.LOW: return 'منخفضة المنسوب ومأمونة';
      default: return level;
    }
  }

  private static translateTaskStatus(status: AdminTaskStatus): string {
    switch (status) {
      case AdminTaskStatus.COMPLETED: return 'تم إنجازها بنجاح';
      case AdminTaskStatus.IN_PROGRESS: return 'قيد التنفيذ والمتابعة';
      case AdminTaskStatus.TODO: return 'بانتظار البدء والاستلام';
      default: return status;
    }
  }

  private static translateTaskPriority(priority: string): string {
    switch (priority) {
      case 'High': return 'قصوى وعاجلة';
      case 'Medium': return 'متوسطة ومقررة';
      case 'Low': return 'اعتيادية';
      default: return priority;
    }
  }
}
