import {
  DuplicateCandidate,
  FundraisingPage,
  MergeAudit,
  RecurringPlan,
  Supporter,
  Transaction
} from '../types';

export interface SeedData {
  supporters: Supporter[];
  transactions: Transaction[];
  recurringPlans: RecurringPlan[];
  fundraisingPages: FundraisingPage[];
  duplicateCandidates: DuplicateCandidate[];
  mergeAudits: MergeAudit[];
}

export const seedData: SeedData = {
  supporters: [
    {
      id: 'SUP-1001',
      firstName: 'Colin',
      lastName: 'Manuel',
      email: 'colin.manuel@gfpro.org',
      phone: '415-555-1001',
      address: '123 Pine St, San Francisco, CA 94104',
      communicationPrefs: { optIn: true },
      createdAt: '2023-02-14',
      updatedAt: '2024-06-10',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1002',
      firstName: 'Colin',
      lastName: 'Manual',
      email: 'colin.manuell@gfpro.org',
      phone: '415-555-1001',
      address: '123 Pine Street, San Francisco, CA 94104',
      communicationPrefs: { optIn: true },
      createdAt: '2023-03-01',
      updatedAt: '2024-05-20',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1003',
      firstName: 'Valeria',
      lastName: 'Marasan',
      email: 'vmarasan@classy.org',
      phone: '703-555-2200',
      address: '5607 Harrington Falls Ln, Alexandria, VA 22312',
      communicationPrefs: { optIn: false },
      createdAt: '2022-11-08',
      updatedAt: '2024-05-18',
      orgId: 'org-1',
      flags: { isHighValue: true, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1004',
      firstName: 'Valeria',
      lastName: 'Marasan',
      email: 'valeria.m@classy.org',
      phone: '703-555-2200',
      address: '5607 Harrington Falls Ln, Alexandria, VA 22312',
      communicationPrefs: { optIn: false },
      createdAt: '2023-01-12',
      updatedAt: '2024-03-20',
      orgId: 'org-1',
      flags: { isHighValue: true, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1005',
      firstName: 'Summit',
      lastName: 'Deshpande',
      email: 'summit.deshpande+280126_1@gofundme.com',
      phone: '510-555-2980',
      address: '2300 Webster St, Oakland, CA 94612',
      communicationPrefs: { optIn: true },
      createdAt: '2024-01-20',
      updatedAt: '2024-06-14',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1006',
      firstName: 'S',
      lastName: 'D',
      email: 'summit.deshpande+1212@gofundme.com',
      phone: '510-555-2980',
      address: '2300 Webster St, Oakland, CA 94612',
      communicationPrefs: { optIn: false },
      createdAt: '2024-02-01',
      updatedAt: '2024-06-13',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1007',
      firstName: 'Mario',
      lastName: 'Bros',
      email: 'mario@bros.com',
      phone: '312-555-0183',
      address: '55 Peach Ave, Chicago, IL 60601',
      communicationPrefs: { optIn: true },
      createdAt: '2023-06-18',
      updatedAt: '2024-04-14',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1008',
      firstName: 'Marcos',
      lastName: 'Ramirez',
      email: 'marcos.ramirez@gmail.com',
      phone: '213-555-7788',
      address: '780 Mission St, Los Angeles, CA 90017',
      communicationPrefs: { optIn: true },
      createdAt: '2022-07-12',
      updatedAt: '2024-06-11',
      orgId: 'org-1',
      flags: { isHighValue: true, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1009',
      firstName: 'Marcos',
      lastName: 'Ramirez',
      email: 'marcos.ramirez@workmail.com',
      phone: '213-555-7788',
      address: '780 Mission Street, Los Angeles, CA 90017',
      communicationPrefs: { optIn: true },
      createdAt: '2022-08-12',
      updatedAt: '2024-05-01',
      orgId: 'org-1',
      flags: { isHighValue: true, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1010',
      firstName: 'Maya',
      lastName: 'Singh',
      email: 'maya.singh@north.org',
      phone: '206-555-8890',
      address: '47 Cedar Ave, Seattle, WA 98101',
      communicationPrefs: { optIn: false },
      createdAt: '2023-04-22',
      updatedAt: '2024-06-07',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: true, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1011',
      firstName: 'Maya',
      lastName: 'Sing',
      email: 'maya.singh@north.org',
      phone: '206-555-8890',
      address: '47 Cedar Avenue, Seattle, WA 98101',
      communicationPrefs: { optIn: false },
      createdAt: '2023-05-05',
      updatedAt: '2024-05-05',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: true, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1012',
      firstName: 'Jon',
      lastName: 'Bierma',
      email: 'jbierma@classy.org',
      phone: '415-555-2231',
      address: '990 Market St, San Francisco, CA 94103',
      communicationPrefs: { optIn: true },
      createdAt: '2024-04-11',
      updatedAt: '2024-06-13',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1013',
      firstName: 'jon',
      lastName: 'bierma',
      email: 'jbierma@gofundme.com',
      phone: '415-555-2231',
      address: '990 Market Street, San Francisco, CA 94103',
      communicationPrefs: { optIn: true },
      createdAt: '2024-04-18',
      updatedAt: '2024-06-14',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1014',
      firstName: 'Isabella',
      lastName: 'Yu',
      email: 'isabella.yu@orchard.org',
      phone: '646-555-2323',
      address: '14 Orchard Rd, New York, NY 10012',
      communicationPrefs: { optIn: true },
      createdAt: '2023-09-17',
      updatedAt: '2024-03-09',
      orgId: 'org-2',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: true },
      status: 'Active'
    },
    {
      id: 'SUP-1015',
      firstName: 'Isabelle',
      lastName: 'Yu',
      email: 'isabella.yu@orchard.org',
      phone: '646-555-2323',
      address: '14 Orchard Road, New York, NY 10012',
      communicationPrefs: { optIn: true },
      createdAt: '2023-10-01',
      updatedAt: '2024-03-11',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: true },
      status: 'Active'
    },
    {
      id: 'SUP-1016',
      firstName: 'Diego',
      lastName: 'Hernandez',
      email: 'diego.h@sunrise.org',
      phone: '512-555-8484',
      address: '900 Riverside, Austin, TX 78701',
      communicationPrefs: { optIn: true },
      createdAt: '2024-01-04',
      updatedAt: '2024-06-02',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1017',
      firstName: 'Diego',
      lastName: 'Hernandez',
      email: 'diego.h@sunrise.org',
      phone: '512-555-8484',
      address: '900 Riverside, Austin, TX 78701',
      communicationPrefs: { optIn: true },
      createdAt: '2024-01-10',
      updatedAt: '2024-06-03',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1018',
      firstName: 'Nina',
      lastName: 'Rao',
      email: 'nina.rao@harbor.org',
      phone: '503-555-1222',
      address: '201 Oak St, Portland, OR 97205',
      communicationPrefs: { optIn: false },
      createdAt: '2022-05-29',
      updatedAt: '2024-04-18',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1019',
      firstName: 'Nina',
      lastName: 'Rao',
      email: 'nina.rao+donor@harbor.org',
      phone: '503-555-1222',
      address: '201 Oak Street, Portland, OR 97205',
      communicationPrefs: { optIn: false },
      createdAt: '2022-06-15',
      updatedAt: '2024-04-19',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    },
    {
      id: 'SUP-1020',
      firstName: 'Priya',
      lastName: 'Das',
      email: 'priya.das@river.org',
      phone: '404-555-9001',
      address: '12 River Rd, Atlanta, GA 30303',
      communicationPrefs: { optIn: true },
      createdAt: '2024-02-12',
      updatedAt: '2024-06-05',
      orgId: 'org-1',
      flags: { isHighValue: false, isDoNotMerge: false, isMultiOrg: false },
      status: 'Active'
    }
  ],
  transactions: [
    {
      id: 'TX-9001',
      supporterId: 'SUP-1001',
      amount: 75.5,
      status: 'Successful',
      campaignName: 'Campaign Studio Testing',
      createdAt: '2024-06-02'
    },
    {
      id: 'TX-9002',
      supporterId: 'SUP-1003',
      amount: 155369.39,
      status: 'Successful',
      campaignName: 'Cart-Royal (don\'t edit)',
      createdAt: '2024-02-11'
    },
    {
      id: 'TX-9003',
      supporterId: 'SUP-1004',
      amount: 112.5,
      status: 'Pending',
      campaignName: 'Multi-Designation Cart',
      createdAt: '2024-02-12'
    },
    {
      id: 'TX-9004',
      supporterId: 'SUP-1005',
      amount: 250,
      status: 'Successful',
      campaignName: 'Summit Donation Page 1610_1',
      createdAt: '2024-03-12'
    },
    {
      id: 'TX-9005',
      supporterId: 'SUP-1006',
      amount: 125,
      status: 'Successful',
      campaignName: 'Summit Donation Page 1610_1',
      createdAt: '2024-03-15'
    },
    {
      id: 'TX-9006',
      supporterId: 'SUP-1008',
      amount: 2525,
      status: 'Successful',
      campaignName: 'Philadelphia Zoo 2025',
      createdAt: '2024-05-11'
    },
    {
      id: 'TX-9007',
      supporterId: 'SUP-1009',
      amount: 250.25,
      status: 'Successful',
      campaignName: 'Philadelphia Zoo 2025',
      createdAt: '2024-05-12'
    },
    {
      id: 'TX-9008',
      supporterId: 'SUP-1012',
      amount: 100,
      status: 'Successful',
      campaignName: 'SF RWF for data sync',
      createdAt: '2024-05-04'
    },
    {
      id: 'TX-9009',
      supporterId: 'SUP-1013',
      amount: 100,
      status: 'Pending',
      campaignName: 'SF RWF for data sync',
      createdAt: '2024-05-07'
    },
    {
      id: 'TX-9010',
      supporterId: 'SUP-1018',
      amount: 55,
      status: 'Successful',
      campaignName: 'Harbor Relief',
      createdAt: '2024-06-10'
    },
    {
      id: 'TX-9011',
      supporterId: 'SUP-1019',
      amount: 65,
      status: 'Successful',
      campaignName: 'Harbor Relief',
      createdAt: '2024-06-11'
    }
  ],
  recurringPlans: [
    {
      id: 'RP-3001',
      supporterId: 'SUP-1003',
      amount: 101,
      frequency: 'Monthly',
      status: 'Active',
      totalDonated: 2791.16,
      createdAt: '2023-05-12'
    },
    {
      id: 'RP-3002',
      supporterId: 'SUP-1004',
      amount: 50,
      frequency: 'Monthly',
      status: 'Active',
      totalDonated: 112.78,
      createdAt: '2023-11-13'
    },
    {
      id: 'RP-3003',
      supporterId: 'SUP-1008',
      amount: 25.25,
      frequency: 'Monthly',
      status: 'Active',
      totalDonated: 225,
      createdAt: '2023-09-26'
    },
    {
      id: 'RP-3004',
      supporterId: 'SUP-1009',
      amount: 100,
      frequency: 'Quarterly',
      status: 'Paused',
      totalDonated: 113,
      createdAt: '2023-09-26'
    },
    {
      id: 'RP-3005',
      supporterId: 'SUP-1010',
      amount: 75,
      frequency: 'Monthly',
      status: 'Cancelled',
      totalDonated: 300,
      createdAt: '2023-02-11'
    },
    {
      id: 'RP-3006',
      supporterId: 'SUP-1012',
      amount: 55.5,
      frequency: 'Monthly',
      status: 'Active',
      totalDonated: 202,
      createdAt: '2024-01-02'
    },
    {
      id: 'RP-3007',
      supporterId: 'SUP-1016',
      amount: 20,
      frequency: 'Monthly',
      status: 'Active',
      totalDonated: 60,
      createdAt: '2024-02-14'
    }
  ],
  fundraisingPages: [
    {
      id: 'FP-7001',
      supporterId: 'SUP-1003',
      name: 'Valeria Test',
      campaignTeam: 'Team Captain',
      status: 'Active',
      totalRaised: 4266.1,
      createdAt: '2024-10-22'
    },
    {
      id: 'FP-7002',
      supporterId: 'SUP-1004',
      name: 'Valeria 2-Step',
      campaignTeam: 'Team Captain',
      status: 'Active',
      totalRaised: 1200,
      createdAt: '2024-09-22'
    },
    {
      id: 'FP-7003',
      supporterId: 'SUP-1008',
      name: 'Marcos Ramirez',
      campaignTeam: 'Philadelphia Zoo 2025',
      status: 'Active',
      totalRaised: 3966.1,
      createdAt: '2024-04-18'
    },
    {
      id: 'FP-7004',
      supporterId: 'SUP-1012',
      name: 'Jon Doe',
      campaignTeam: 'SF RWF for data sync',
      status: 'Active',
      totalRaised: 100,
      createdAt: '2024-05-02'
    },
    {
      id: 'FP-7005',
      supporterId: 'SUP-1013',
      name: 'Jon Doe',
      campaignTeam: 'SF RWF for data sync',
      status: 'Active',
      totalRaised: 55,
      createdAt: '2024-05-02'
    }
  ],
  duplicateCandidates: [
    {
      id: 'DC-2001',
      orgId: 'org-1',
      supporterAId: 'SUP-1001',
      supporterBId: 'SUP-1002',
      confidenceScore: 92,
      matchReasons: ['Same phone', 'Similar name', 'Same address'],
      recommendedPrimaryId: 'SUP-1001',
      riskFlags: [],
      status: 'Suggested',
      createdAt: '2024-06-14'
    },
    {
      id: 'DC-2002',
      orgId: 'org-1',
      supporterAId: 'SUP-1003',
      supporterBId: 'SUP-1004',
      confidenceScore: 88,
      matchReasons: ['Same name + ZIP', 'Same phone'],
      recommendedPrimaryId: 'SUP-1003',
      riskFlags: ['High value donor', 'Both have active recurring plans'],
      status: 'Suggested',
      createdAt: '2024-06-10'
    },
    {
      id: 'DC-2003',
      orgId: 'org-1',
      supporterAId: 'SUP-1005',
      supporterBId: 'SUP-1006',
      confidenceScore: 74,
      matchReasons: ['Same phone', 'Email alias'],
      recommendedPrimaryId: 'SUP-1005',
      riskFlags: [],
      status: 'Suggested',
      createdAt: '2024-06-12'
    },
    {
      id: 'DC-2004',
      orgId: 'org-1',
      supporterAId: 'SUP-1008',
      supporterBId: 'SUP-1009',
      confidenceScore: 81,
      matchReasons: ['Exact phone match', 'Same name + ZIP'],
      recommendedPrimaryId: 'SUP-1008',
      riskFlags: ['High value donor'],
      status: 'Suggested',
      createdAt: '2024-06-08'
    },
    {
      id: 'DC-2005',
      orgId: 'org-1',
      supporterAId: 'SUP-1010',
      supporterBId: 'SUP-1011',
      confidenceScore: 95,
      matchReasons: ['Exact email match', 'Same phone'],
      recommendedPrimaryId: 'SUP-1010',
      riskFlags: ['Do not merge'],
      status: 'Suggested',
      createdAt: '2024-06-07'
    },
    {
      id: 'DC-2006',
      orgId: 'org-1',
      supporterAId: 'SUP-1012',
      supporterBId: 'SUP-1013',
      confidenceScore: 63,
      matchReasons: ['Same phone', 'Similar name'],
      recommendedPrimaryId: 'SUP-1012',
      riskFlags: ['Conflicting emails'],
      status: 'Suggested',
      createdAt: '2024-06-05'
    },
    {
      id: 'DC-2007',
      orgId: 'org-1',
      supporterAId: 'SUP-1014',
      supporterBId: 'SUP-1015',
      confidenceScore: 90,
      matchReasons: ['Exact email match', 'Same phone'],
      recommendedPrimaryId: 'SUP-1015',
      riskFlags: ['Multi-org'],
      status: 'Suggested',
      createdAt: '2024-06-04'
    },
    {
      id: 'DC-2008',
      orgId: 'org-1',
      supporterAId: 'SUP-1016',
      supporterBId: 'SUP-1017',
      confidenceScore: 86,
      matchReasons: ['Exact email match', 'Exact phone match'],
      recommendedPrimaryId: 'SUP-1016',
      riskFlags: [],
      status: 'Suggested',
      createdAt: '2024-06-03'
    },
    {
      id: 'DC-2009',
      orgId: 'org-1',
      supporterAId: 'SUP-1018',
      supporterBId: 'SUP-1019',
      confidenceScore: 58,
      matchReasons: ['Same name + ZIP'],
      recommendedPrimaryId: 'SUP-1018',
      riskFlags: ['Conflicting emails'],
      status: 'Suggested',
      createdAt: '2024-06-02'
    },
    {
      id: 'DC-2010',
      orgId: 'org-1',
      supporterAId: 'SUP-1019',
      supporterBId: 'SUP-1020',
      confidenceScore: 45,
      matchReasons: ['Same ZIP', 'Similar phone'],
      recommendedPrimaryId: 'SUP-1019',
      riskFlags: ['Low confidence'],
      status: 'Suggested',
      createdAt: '2024-06-01'
    }
  ],
  mergeAudits: [
    {
      id: 'MA-5001',
      orgId: 'org-1',
      mergedAt: '2024-05-30 09:12',
      mergedBy: 'J. Alvarez',
      primaryId: 'SUP-1007',
      secondaryId: 'SUP-1017',
      movedCounts: {
        transactions: 1,
        recurringPlans: 0,
        fundraisingPages: 0
      },
      fieldResolutions: {
        email: 'SUP-1007',
        phone: 'SUP-1017',
        address: 'SUP-1007'
      },
      warningsShown: ['Primary email retained'],
      dryRunSummary: '1 transaction moved. Secondary marked as merged.'
    }
  ]
};
