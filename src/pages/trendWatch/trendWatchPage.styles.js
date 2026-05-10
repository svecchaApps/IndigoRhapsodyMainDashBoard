import styled from "styled-components";
import { BlockContentWrap } from "../../styles/global/default";

export const TrendWatchWrap = styled.div`
  ${BlockContentWrap};
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .page-header {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }

  .stat-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }

  .table-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    background: white;
    overflow: hidden;

    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
      color: #1a1a1a;
    }

    .ant-table-tbody > tr:hover > td {
      background: #f8f9fa;
    }
  }

  .product-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f0f5ff;
    border: 1px solid #adc6ff;
    color: #2f54eb;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;
    margin: 2px;
  }

  .small-thumb {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
  }

  .image-url-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #f0f0f0;
      flex-shrink: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .page-header {
      padding: 16px;
    }
  }
`;
