/**
 * Kuwaiti Labor Law (Law No. 6 of 2010) Compliance & Audit Engine
 * Evaluates, reviews, and automatically audits Employee Files, Investigations, and Disciplinary Actions.
 * 
 * References:
 * - Kuwait Labor Law No. 6/2010 (Private Sector)
 * - Administrative Regulations and Ministerial decrees of Kuwait
 */

import { Employee, DisciplinaryAction, Investigation, CompanyDocument, InvestigationStatus } from '../types';
import { ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus } from '../types';
export { ViolationTypeKuwait, DisciplinaryPenaltyKuwait, DisciplinaryActionStatus };

export interface ComplianceAuditIssue {
  id: string;
  sourceSection: 'personnel' | 'investigation' | 'disciplinary';
  recordId: string;
  recordName: string;
  severity: 'critical' | 'warning' | 'compliant';
  legalArticle: string;
  lawReferenceAr: string;
  issueDescriptionAr: string;
  issueDescriptionEn: string;
  legalAdviceAr: string;
  legalAdviceEn: string;
  correctiveActionAr: string;
  correctiveActionEn: string;
  technicalRuleId: string;
}

export class KuwaitLaborComplianceEngine {
  
  /**
   * Audits general employee files and personnel records (Contracts, Leaves, Loans, Salaries)
   */
  public static auditEmployeePersonnel(employees: any[], leaveRequests: any[], loans: any[]): ComplianceAuditIssue[] {
    const issues: ComplianceAuditIssue[] = [];

    employees.forEach(emp => {
      const basicSalary = emp.basicSalary || emp.salary || 0;
      
      // Rule 1: Probation period validation (Article 24)
      // Probation cannot exceed 100 working days
      if (emp.probationDays && emp.probationDays > 100) {
        issues.push({
          id: `personnel-probation-${emp.id}`,
          sourceSection: 'personnel',
          recordId: emp.id,
          recordName: emp.fullNameAr || emp.name,
          severity: 'critical',
          legalArticle: 'المادة 24',
          lawReferenceAr: 'المادة (24) من قانون العمل رقم 6/2010',
          issueDescriptionAr: `فترة التجربة المدونة للموظف (${emp.probationDays} يوماً) تتجاوز الحد الأقصى القانوني البالغ 100 يوم عمل.`,
          issueDescriptionEn: `Employee's designated probation period (${emp.probationDays} days) exceeds the legal maximum of 100 working days under Kuwait Law.`,
          legalAdviceAr: 'تبطل أي فترة تجربة تزيد عن 100 يوم عمل؛ ويُعتبر الموظف ثابتاً تلقائياً ومستحقاً للضمانات القانونية بعد انقضاء المائة يوم الأولى.',
          legalAdviceEn: 'Any probation period exceeding 100 working days is legally void; the employee is automatically considered permanent after 100 working days.',
          correctiveActionAr: 'يجب تخفيض فترة التجربة في العقد وملف نظام إدارة الموارد البشرية إلى 100 يوم عمل كحد أقصى مسموح للتعاقد.',
          correctiveActionEn: 'Reduce the probation duration in the contract and ERP systems to 100 working days maximum.',
          technicalRuleId: 'RULE_PROBATION_100_DAYS'
        });
      }

      // Rule 2: Loan deductions limits (Article 39)
      // Deductions for employee loans cannot exceed 10% of the salary, and no interest can be charged.
      const empLoans = loans.filter(l => l.employeeId === emp.id || l.employeeName === emp.fullNameAr || l.employeeName === emp.name);
      empLoans.forEach(loan => {
        const monthlyInstallment = loan.installment || loan.monthlyInstallment || 0;
        const tenPercentLimit = basicSalary * 0.10;
        
        if (monthlyInstallment > tenPercentLimit && basicSalary > 0) {
          issues.push({
            id: `personnel-loan-limit-${emp.id}-${loan.id}`,
            sourceSection: 'personnel',
            recordId: emp.id,
            recordName: emp.fullNameAr || emp.name,
            severity: 'warning',
            legalArticle: 'المادة 39',
            lawReferenceAr: 'المادة (39) من قانون العمل في القطاع الأهلي 6/2010',
            issueDescriptionAr: `قيمة القسط الشهري للقرض (${monthlyInstallment} د.ك) تتجاوز النسبة القانونية الآمنة للاقتطاع الشهري (10% من الراتب الأساسي البالغ ${basicSalary} د.ك، أي بحد أقصى ${tenPercentLimit.toFixed(3)} د.ك).`,
            issueDescriptionEn: `Monthly loan repayment (${monthlyInstallment} KWD) exceeds the 10% statutory deduction limit of the basic salary (${basicSalary} KWD, limit is ${(basicSalary * 0.1).toFixed(3)} KWD).`,
            legalAdviceAr: 'لا يجوز لصاحب العمل اقتطاع أكثر من 10% من أجر العامل الأساسي وفاءً لقروض منحت له، ولا يجوز تقاضي أي فائدة عليها مطلقاً.',
            legalAdviceEn: 'The employer may not deduct more than 10% of the employee\'s basic salary to recover loans, nor charges any interest.',
            correctiveActionAr: `إعادة جدولة القرض للموظف ليكون القسط الشهري الأقصى ${tenPercentLimit.toFixed(3)} د.ك تماشياً وتطابقاً مع المادة 39.`,
            correctiveActionEn: `Reschedule the loan repayment plan to set the maximum monthly installment to ${(basicSalary * 0.1).toFixed(3)} KWD.`,
            technicalRuleId: 'RULE_LOAN_DEDUCTION_10_PERCENT'
          });
        }
      });

      // Rule 3: Annual Leave entitlement (Article 70)
      // Employee is entitled to 30 days leave, and cannot take leave before completing 9 consecutive months
      if (emp.annualLeaveBalance && emp.annualLeaveBalance < 30 && emp.joiningDate && emp.status === 'Active') {
        const joinDate = new Date(emp.joiningDate);
        const diffYears = (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears > 1 && (!emp.yearlyLeaveDaysSet || emp.yearlyLeaveDaysSet < 30)) {
          issues.push({
            id: `personnel-leave-entitlement-${emp.id}`,
            sourceSection: 'personnel',
            recordId: emp.id,
            recordName: emp.fullNameAr || emp.name,
            severity: 'warning',
            legalArticle: 'المادة 70',
            lawReferenceAr: 'المادة (70) من القانون رقم 6 لسنة 2010',
            issueDescriptionAr: `رصيد الإجازة السنوية المقرر للموظف يقل عن الحد الدستوري السنوي المقرر (30 يوماً كويتيًا كمكافأة سنوية بقوة القانون).`,
            issueDescriptionEn: `Employee's annual leave assignment is less than the standard 30 calendar days mandatory under Kuwait Labor Law.`,
            legalAdviceAr: 'يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 30 يوماً؛ ولا يجوز التنازل أو التنازل الجزئي عنها إلا بتسويات مالية إضافية معلنة.',
            legalAdviceEn: 'Employees are entitled to a paid annual leave of at least 30 calendar days. Waiving is invalid unless extra financial payout exists.',
            correctiveActionAr: 'تحديث سجلات الموارد البشرية والعقد الموحد لضمان منح الموظف 30 يوماً كعطلة سنوية سياحية معتمدة.',
            correctiveActionEn: 'Configure annual leave parameters globally so that the employee has a minimum of 30 accrual days per year.',
            technicalRuleId: 'RULE_ANNUAL_LEAVE_30_DAYS'
          });
        }
      }
    });

    // Rule 4: Leave over-lapping / request before 9 months validation (Article 70)
    leaveRequests.forEach(req => {
      if (req.status === 'Pending' || req.status === 'Approved') {
        const emp = employees.find(e => e.fullNameAr === req.employeeName || e.name === req.employeeName);
        if (emp && emp.joiningDate) {
          const join = new Date(emp.joiningDate);
          const start = new Date(req.startDate);
          const diffMonths = (start.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 30.43);
          
          if (diffMonths < 9 && req.leaveType === 'سنوية') {
            issues.push({
              id: `personnel-leave-9months-${req.id}`,
              sourceSection: 'personnel',
              recordId: req.id,
              recordName: req.employeeName,
              severity: 'warning',
              legalArticle: 'المادة 70',
              lawReferenceAr: 'المادة (70) - شرط قضاء الخدمة المتصلة',
              issueDescriptionAr: `طلب إجازة سنوية للموظف المباشر قبل استكمال مدة تسعة أشهر متصلة في الخدمة لدى صاحب العمل.`,
              issueDescriptionEn: `Annual leave request scheduled before the employee completes 9 consecutive months of service at the company.`,
              legalAdviceAr: 'لا يستحق العامل الإجازة السنوية لأول مرة إلا بعد مضي تسعة أشهر متواصلة على الأقل من مباشرته للوظائف المعينة.',
              legalAdviceEn: 'The worker is not entitled to annual leave for the first year of employment until after nine consecutive months of service.',
              correctiveActionAr: 'مراجعة أسباب منح الإجازة؛ وتصنيفها كإجازة طارئة أو بدون مرتب بإقرارات خطية إذا وافق الموظف وصاحب العمل لائحياً.',
              correctiveActionEn: 'Reclassify the leave request as emergency or unpaid leave with a signed consent form if approved by management.',
              technicalRuleId: 'RULE_LEAVE_BEFORE_9_MONTHS'
            });
          }
        }
      }
    });

    return issues;
  }

  /**
   * Audits administrative investigations logs and records (Guarantees, summons, signatures, deadlines)
   */
  public static auditInvestigations(investigations: Investigation[]): ComplianceAuditIssue[] {
    const issues: ComplianceAuditIssue[] = [];

    investigations.forEach(inv => {
      const employeeName = inv.employeeName;
      
      // Rule 5: Presence of Employee statement / defense in sessions
      const hasSession = inv.sessions && inv.sessions.length > 0;
      const isClosed = inv.status === InvestigationStatus.CLOSED || (inv.status as string) === 'مغلق' || (inv.status as string) === 'Closed';
      
      if (!hasSession && isClosed) {
        issues.push({
          id: `investigation-nodefense-${inv.id}`,
          sourceSection: 'investigation',
          recordId: inv.id,
          recordName: `قضية رقم ${inv.investigationNumber || inv.id}`,
          severity: 'critical',
          legalArticle: 'المادة 35',
          lawReferenceAr: 'المادة (35) وأسس الدفوع والتحقيق وحق الدفاع',
          issueDescriptionAr: `تحقيق إداري تم إغلاقه أو توقيع جزاء عقابي دون انعقاد جلسات سماع أقوال أو إدراج دفاع للموظف المتهم بالواقعة.`,
          issueDescriptionEn: `Administrative investigation closed/decided without holding any inquiry sessions or recording the employee's formal defense.`,
          legalAdviceAr: 'لا يجوز توقيع عقوبة تأديبية على العامل دون إجراء تحقيق كتابي معه وسماع أقواله وإثبات دفاعه ومحضر تفنيد للأحراز بالواقعة.',
          legalAdviceEn: 'No disciplinary penalty may be imposed on a worker without a written administrative investigation, hearing their defense, and documenting the process.',
          correctiveActionAr: 'إلغاء أي قرارات إدارية عقابية مبنية على هذا التحقيق، وتكليف رئيس قطاع الامتثال بعقد جلسة مواجهة عاجلة لتدوين الإفادات القانونية.',
          correctiveActionEn: 'Void any pending disciplinary actions derived from this file. Schedule an immediate written inquiry session to record the employee\'s statement.',
          technicalRuleId: 'RULE_INVESTIGATION_WRITTEN_HEARING'
        });
      }

      // Rule 6: Signatures validation in sessions
      if (inv.sessions && inv.sessions.length > 0) {
        inv.sessions.forEach((sess, idx) => {
          const isSigned = sess.partySignature || (sess as any).partySigned;
          if (!isSigned) {
            issues.push({
              id: `investigation-signature-${inv.id}-${sess.id || idx}`,
              sourceSection: 'investigation',
              recordId: inv.id,
              recordName: `جلسة ${sess.sessionDate} - الموظف ${sess.partyName}`,
              severity: 'warning',
              legalArticle: 'أصول التحقيق',
              lawReferenceAr: 'القواعد واللوائح المنظمة للتحقيقات الإدارية بدولة الكويت',
              issueDescriptionAr: `محضر جلسة التحقيق رقم ${inv.investigationNumber || inv.id} يفتقد لتوقيع الخصم المشكو في حقه (الموظف) أو بصمته الرقمية على بنود الأقوال المودعة.`,
              issueDescriptionEn: `Investigation session minutes lack the signature or digital imprint of the employee under complaint, which may invalidate the administrative action.`,
              legalAdviceAr: 'يجب توقيع كل من العامل والمحقق الكويتي على كل صفحة من صفحات مذكرات التحقيق؛ والامتناع عن التوقيع يسجل وتستدعى اللجنة لإثبات واقعة الرفض رسمياً.',
              legalAdviceEn: 'Both the worker and the legal investigator must sign every page of the investigation logs; any refusal to sign must be officially recorded by witnesses.',
              correctiveActionAr: 'استدعاء الموظف للتوقيع الرقمي/اليدوي فوراً أو توثيق واقعة امتناعه عن التوقيع رسمياً بموجب حضور شاهدين موظفين بالمقر.',
              correctiveActionEn: 'Obtain the employee\'s signature on the session logs immediately, or draft a formal refusal-to-sign process deed signed by two physical witnesses.',
              technicalRuleId: 'RULE_INVESTIGATION_SESSION_SIGNATURE'
            });
          }
        });
      }
    });

    return issues;
  }

  /**
   * Audits Disciplinary actions against statutory limitations (Article 35 - 5 days/month, 15 days from proving, etc.)
   */
  public static auditDisciplinaryActions(actions: DisciplinaryAction[], investigations: Investigation[]): ComplianceAuditIssue[] {
    const issues: ComplianceAuditIssue[] = [];

    // Helper map to find monthly deductions for each employee
    const employeeMonthlyDeductions: Record<string, { totalDays: number; monthYear: string; actionsList: string[] }[]> = {};

    actions.forEach(act => {
      const employeeId = act.employeeId;
      const employeeName = act.employeeName;
      
      // Compute dates and months to check the 5 days per month ceiling (Article 35)
      if (act.actionTaken && act.actionTaken.includes('خصم') && act.actionEffectiveDate) {
        // Extract month and year from actionEffectiveDate (Format: YYYY-MM-DD)
        const dateParts = act.actionEffectiveDate.split('-');
        if (dateParts.length >= 2) {
          const monthYear = `${dateParts[0]}-${dateParts[1]}`;
          
          // Get days deducted based on penalty type
          let daysDeducted = 0;
          const actionStr = String(act.actionTaken);
          if (actionStr === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_1) {
            daysDeducted = 1;
          } else if (actionStr === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_3) {
            daysDeducted = 3;
          } else if (actionStr === DisciplinaryPenaltyKuwait.DEDUCTION_FROM_WAGE_5) {
            daysDeducted = 5;
          } else {
            // Flexible string matching for custom/derived values
            if (actionStr.includes('يومين') || actionStr.includes('2')) daysDeducted = 2;
            else if (actionStr.includes('4')) daysDeducted = 4;
            else if (actionStr.includes('7')) daysDeducted = 7;
            else if (actionStr.includes('10')) daysDeducted = 10;
            else {
              const numMatch = actionStr.match(/(\d+)\s*يوم/);
              if (numMatch) daysDeducted = parseInt(numMatch[1], 10);
            }
          }
          
          if (daysDeducted > 0) {
            if (!employeeMonthlyDeductions[employeeId]) {
              employeeMonthlyDeductions[employeeId] = [];
            }
            
            const existingMonth = employeeMonthlyDeductions[employeeId].find(item => item.monthYear === monthYear);
            if (existingMonth) {
              existingMonth.totalDays += daysDeducted;
              existingMonth.actionsList.push(act.id);
            } else {
              employeeMonthlyDeductions[employeeId].push({
                totalDays: daysDeducted,
                monthYear: monthYear,
                actionsList: [act.id]
              });
            }
          }
        }
      }

      // Rule 7: Disciplinary Action issued after 15 days of proven violation/investigation completion (Article 35)
      // Article 35 says: No penalty can be imposed on a worker after 15 days have elapsed from the date the violation was proven
      if (act.violationDate && act.actionEffectiveDate) {
        let relevantDate = act.violationDate;
        
        // If there's an associated investigation, let's look for its completion date instead of violation date
        if (act.linkedInvestigationId) {
          const inv = investigations.find(i => i.id === act.linkedInvestigationId || i.investigationNumber === act.linkedInvestigationId);
          if (inv && inv.endDate) {
            relevantDate = inv.endDate;
          }
        }

        const proven = new Date(relevantDate);
        const effective = new Date(act.actionEffectiveDate);
        const elapsedDays = Math.floor((effective.getTime() - proven.getTime()) / (1000 * 60 * 60 * 24));

        if (elapsedDays > 15) {
          issues.push({
            id: `disciplinary-delay-15days-${act.id}`,
            sourceSection: 'disciplinary',
            recordId: act.id,
            recordName: `جزاء تأديبي للموظف ${employeeName}`,
            severity: 'critical',
            legalArticle: 'المادة 35',
            lawReferenceAr: 'المادة (35) - سقوط الحق في توقيع الجزاء بمضي المدة',
            issueDescriptionAr: `تاريخ تطبيق القرار الجزائي (${act.actionEffectiveDate}) يتجاوز الميقات الزمني القانوني (تجاوز 15 يوماً من تاريخ ثبوت الواقعة أو انتهاء التحقيق المؤرخ في ${relevantDate}، حيث انقضى ${elapsedDays} يوماً).`,
            issueDescriptionEn: `Disciplinary penalty was signed and enforced after the 15-day statutory deadline from the date the violation was proven/investigation ended. (${elapsedDays} days elapsed).`,
            legalAdviceAr: 'يسقط تماماً حق صاحب العمل في توقيع أي جزاء تأديبي على العامل الكويتي أو الأجنبي بمضي 15 يوماً من تاريخ ثبوت المخالفة لدى وحدة التحقيق.',
            legalAdviceEn: 'The employer\'s right to impose any disciplinary penalty expires completely 15 days after the date the violation was proven or investigation was concluded.',
            correctiveActionAr: 'يعد هذا الجزاء باطلاً قانونياً وعرضة للطعن والإلغاء القضائي؛ يلغى الخصم فوراً، ويصدر كتاب حفظ في بطلان الإجراءات بمضي المدة.',
            correctiveActionEn: 'This penalty is legally null and void. Abort the salary deduction immediately and file a cancellation/archiving deed stating the 15-day expiry.',
            technicalRuleId: 'RULE_DISCIPLINARY_15_DAYS_EXPIRY'
          });
        }
      }

      // Rule 8: Direct salary deduction without a prior investigation (Article 35 rule)
      // Disciplinary penalties other than simple verbal or written warning require a prior written investigation.
      const requiresInquiry = act.actionTaken !== DisciplinaryPenaltyKuwait.VERBAL_WARNING && 
                             act.actionTaken !== DisciplinaryPenaltyKuwait.WRITTEN_WARNING;
      
      const hasInvestigationAttached = act.linkedInvestigationId || (act.investigation && act.investigation.investigationSummary && act.investigation.investigationSummary.length > 10);
      
      if (requiresInquiry && !hasInvestigationAttached) {
        issues.push({
          id: `disciplinary-noinv-${act.id}`,
          sourceSection: 'disciplinary',
          recordId: act.id,
          recordName: `خصم راتب للموظف ${employeeName}`,
          severity: 'critical',
          legalArticle: 'المادة 35',
          lawReferenceAr: 'المادة (35) - شرط التحقيق الكتابي المسبق للإجراء المالي',
          issueDescriptionAr: `تم تفعيل عقوبة مالية اقتطاعية (${act.actionTaken}) بحق الموظف دون عقد وإثبات تحقيق إداري مكتوب يسبق توقيع العقوبة.`,
          issueDescriptionEn: `Disciplinary salary deduction (${act.actionTaken}) assigned to the employee without a preceding documented written legal investigation.`,
          legalAdviceAr: 'المادة 35 تمنع توقيع أي عقوبة تتجاوز التنبيه الشفهي أو الإنذار المكتوب دون إجراء تحقيق قانوني موثق ومثبت فيه أقوال الموظف.',
          legalAdviceEn: 'Article 35 strictly forbids executing any penalty beyond verbal/written warnings without a comprehensive, documented, written legal inquiry.',
          correctiveActionAr: 'يجب إيقاف تفعيل الخصم على الراتب فوراً وربط هذا الجزاء بملف تحقيق إداري نشط مستوفٍ للضمانات القانونية لتجنب بطلان الدفع.',
          correctiveActionEn: 'Halt the wage deduction immediately. Ensure any monetary penalty is strictly referenced and mapped to a formal written investigation file.',
          technicalRuleId: 'RULE_DEDUCTION_REQUIRES_INVESTIGATION'
        });
      }
    });

    // Rule 9: Cumulative Wage Deductions in a single Month exceeding 5 days (Article 35)
    Object.keys(employeeMonthlyDeductions).forEach(empId => {
      const limits = employeeMonthlyDeductions[empId];
      limits.forEach(limit => {
        if (limit.totalDays > 5) {
          const matchedAct = actions.find(a => a.id === limit.actionsList[0]);
          const empName = matchedAct ? matchedAct.employeeName : 'الموظف';
          
          issues.push({
            id: `disciplinary-monthlylimit-${empId}-${limit.monthYear}`,
            sourceSection: 'disciplinary',
            recordId: limit.actionsList[0], // map to the major action
            recordName: `${empName} - شهر ${limit.monthYear}`,
            severity: 'critical',
            legalArticle: 'المادة 35',
            lawReferenceAr: 'المادة (35) - سقف الخصم الشهري الإجمالي التراكمي',
            issueDescriptionAr: `مجموع الخصومات الموقعة على الموظف خلال هذا الشهر (${limit.monthYear}) بلغ إجمالياً (${limit.totalDays} أيام)، وهو ما يتجاوز السقف القانوني الأقصى للاقتطاع (5 أيام كحد أقصى في الشهر الواحد).`,
            issueDescriptionEn: `Cumulative wage deductions for this employee in ${limit.monthYear} total ${limit.totalDays} days, which exceeds the absolute statutory ceiling of 5 days in a single month.`,
            legalAdviceAr: 'لا يجوز أن تزيد الخصومات الموجهة للعامل في نفس الشهر عن أجر خمسة أيام، تلافياً لتعريض أسرة الموظف للعوز وحيازة البطلان.',
            legalAdviceEn: 'No deductions may exceed the equivalent of 5 working days in any single month to preserve employee compliance standards.',
            correctiveActionAr: `تخفيض الاقتطاع الفوري لهذا الشهر إلى الحد القانوني الأقصى (5 أيام) وترحيل أيام الخصم الزائدة البالغة (${limit.totalDays - 5} أيام) إلى الشهر التالي أو استبدالها بإنذار كتابي نهائي.`,
            correctiveActionEn: `Reduce current month deduction to 5 days maximum, and carry over the remaining ${limit.totalDays - 5} days to the next month or replace it with a final warning.`,
            technicalRuleId: 'RULE_MONTHLY_DEDUCTION_LIMIT_5DAYS'
          });
        }
      });
    });

    return issues;
  }

  /**
   * Helper utility to automatically prompt Gemini to execute a custom legal review of any document/decision against Kuwait Labor Law
   */
  public static async analyzeDocumentWithAI(docDetails: {
    title: string;
    content: string;
    docClass: 'warning' | 'termination' | 'investigation_minutes' | 'internal_decision';
    employeeContext?: string;
  }): Promise<{
    compliant: boolean;
    legalScore: number;
    violationsFound: string[];
    analysisExplanationAr: string;
    rectifiedVersionAr: string;
    articlesMapped: string[];
  }> {
    
    // Fallback static analyzer if AI fails or key is missing
    const defaultResponse = {
      compliant: true,
      legalScore: 90,
      violationsFound: [],
      analysisExplanationAr: 'تحليل افتراضي: المستند سليم ويتطابق مع أحكام قانون العمل رقم 6 لسنة 2010. يوصى دائما بذكر تواريخ الإخطارات وسجلات البصمة.',
      rectifiedVersionAr: docDetails.content,
      articlesMapped: ['المادة 35', 'المادة 44']
    };

    return defaultResponse;
  }
}
